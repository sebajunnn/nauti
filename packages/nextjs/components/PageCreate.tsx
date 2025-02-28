"use client";

import { useEffect, useState, useCallback } from "react";
import deployedContracts from "../contracts/deployedContracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import * as Babel from "@babel/standalone";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import { parseEther } from "viem";
import { useWriteContract, useChainId } from "wagmi";
import { useDropzone } from "react-dropzone";
import { notification } from "@/utils/scaffold-eth";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function PageCreate() {
    const chainId = useChainId();
    const [content, setContent] = useState("<h1>Hello, Web3!</h1>");
    const [editedGLB, setEditedGLB] = useState(false);
    const [editedReact, setEditedReact] = useState(false);
    const [language, setLanguage] = useState("glb");
    const [compiledCode, setCompiledCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEditorLoading, setIsEditorLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [uploadedGlbUrl, setUploadedGlbUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isImageUploading, setIsImageUploading] = useState(false);

    const { writeContract } = useWriteContract();

    const createPage = async () => {
        if (!chainId) return;
        if (!content.trim()) {
            setError("Please enter some content");
            return;
        }

        if (!uploadedImageUrl) {
            setError("Please upload a preview image");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await writeContract({
                address:
                    deployedContracts[chainId as keyof typeof deployedContracts].OnchainWebServer_v8
                        .address,
                abi: deployedContracts[chainId as keyof typeof deployedContracts]
                    .OnchainWebServer_v8.abi,
                functionName: "mintPage",
                args: [
                    language === "jsx" || language === "tsx" ? compiledCode : content,
                    name,
                    description,
                    uploadedImageUrl,
                ],
                value: parseEther("0.01"),
            });
            setError(null);
        } catch (error) {
            console.error("Error creating page:", error);
            setError("Failed to create page. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getEditorExtension = () => {
        if (language === "html" || language === "glb") return html();
        if (language === "jsx" || language === "tsx")
            return javascript({ jsx: true, typescript: language === "tsx" });
        return html();
    };

    useEffect(() => {
        if (language === "glb") {
            setContent(getGLBTemplate());
            setEditedGLB(true);
        } else if ((language === "jsx" || language === "tsx") && !editedReact) {
            setContent(getReactTemplate());
            setEditedReact(true);
        } else if (language === "html" && content === "<h1>Hello, Web3!</h1>") {
            setContent(getHTMLTemplate());
        }

        // Reset editedReact when switching between JSX and TSX
        if (language === "jsx" || language === "tsx") {
            setEditedReact(false);
        }
    }, [language]);

    useEffect(() => {
        if (language === "jsx" || language === "tsx") {
            try {
                if (content.includes("<!DOCTYPE html>")) {
                    // If switching from GLB/HTML to JSX/TSX, reset to React template
                    setContent(getReactTemplate());
                    return;
                }

                const babelOptions = {
                    presets: ["react", "env"],
                    filename: language === "tsx" ? "component.tsx" : "component.jsx",
                };

                const transformedCode = Babel.transform(
                    `
          function App() {
            ${content}
            return React.createElement(MyComponent);
          }
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
          `,
                    babelOptions
                ).code;

                setCompiledCode(`
          <html>
            <head>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            </head>
            <body>
              <div id="root"></div>
              <script>
                try {
                  ${transformedCode}
                } catch (e) {
                  document.body.innerHTML = '<pre style="color: red;">' + e.toString() + '</pre>';
                }
              </script>
            </body>
          </html>
        `);
            } catch (err) {
                console.error("Babel Compilation Error:", err);
            }
        } else {
            setCompiledCode(content);
        }
    }, [content, language]);

    useEffect(() => {
        // Short timeout to ensure CodeMirror is mounted
        const timer = setTimeout(() => {
            setIsEditorLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            setIsUploading(true);
            setError(null);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    notification.error("Upload failed");
                }

                const data = await response.json();
                const ipfsUrl = `https://ipfs.io/ipfs/${data.IpfsHash}`;

                setUploadedGlbUrl(ipfsUrl);
                // Update content with new GLB URL
                if (language === "glb") {
                    setContent((prev) =>
                        prev.replace(/src="https?:\/\/[^\/]+\/ipfs\/[^"]+"/, `src="${ipfsUrl}"`)
                    );
                }
            } catch (err) {
                console.error("Upload error:", err);
                setError("Failed to upload GLB file");
            } finally {
                setIsUploading(false);
            }
        },
        [language]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "model/gltf-binary": [".glb"],
        },
        maxFiles: 1,
    });

    const onImageDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsImageUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                notification.error("Image upload failed");
                return;
            }

            const data = await response.json();
            const ipfsUrl = `https://ipfs.io/ipfs/${data.IpfsHash}`;
            setUploadedImageUrl(ipfsUrl);
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload image");
        } finally {
            setIsImageUploading(false);
        }
    }, []);

    const {
        getRootProps: getImageRootProps,
        getInputProps: getImageInputProps,
        isDragActive: isImageDragActive,
    } = useDropzone({
        onDrop: onImageDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        },
        maxFiles: 1,
    });

    return (
        <div className="w-full h-screen p-2 mx-auto space-y-0 space-x-0 flex flex-row gap-2 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden bg-accent rounded-4xl p-0">
                <CardHeader className="flex flex-row items-center justify-between py-0 flex-none bg-white">
                    <div className="flex items-center gap-2 pt-2">
                        <Image
                            src="/nauti-logo-b.svg"
                            alt="Nauti Logo"
                            width={24}
                            height={24}
                            className="text-primary"
                        />
                        <CardTitle className="text-3xl font-bold tracking-tighter font-rubik">
                            Publish your Web3 Page
                        </CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-muted h-7 px-3 flex items-center rounded-xl text-sm font-medium">
                            Cost: 0.01 ETH
                        </div>
                        <Button
                            onClick={createPage}
                            disabled={isLoading}
                            className="min-w-[160px] h-7 px-1 rounded-xl hover:bg-chart-3 hover:text-white"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </div>
                            ) : (
                                "Deploy to Blockchain"
                            )}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 overflow-hidden flex flex-col pt-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-4 h-full min-h-0">
                        <div className="flex gap-2 flex-none">
                            <Select value={language} onValueChange={(value) => setLanguage(value)}>
                                <SelectTrigger className="w-[180px] bg-background rounded-xl">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent className="bg-background rounded-xl">
                                    <SelectItem className="rounded-lg" value="html">
                                        HTML
                                    </SelectItem>
                                    <SelectItem className="rounded-lg" value="jsx">
                                        JavaScript (JSX)
                                    </SelectItem>
                                    <SelectItem className="rounded-lg" value="tsx">
                                        TypeScript (TSX)
                                    </SelectItem>
                                    <SelectItem className="rounded-lg" value="glb">
                                        GLB
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Enter page name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 bg-background rounded-xl"
                            />
                        </div>
                        <div className="flex flex-row gap-2 flex-none h-[180px]">
                            <div className="flex-shrink-0 bg-background rounded-xl p-2 w-[180px] h-full">
                                <div
                                    {...getImageRootProps()}
                                    className={`border-2 w-full h-full border-dashed
                                        rounded-lg text-center cursor-pointer
                                        transition-colors flex flex-col items-center
                                        justify-center
                                ${
                                    isImageDragActive
                                        ? "border-primary bg-primary/10"
                                        : "border-muted-foreground/25"
                                }
                                ${isImageUploading ? "opacity-50 pointer-events-none" : ""}}
                                ${uploadedImageUrl ? "p-1" : "p-4"}`}
                                >
                                    <input {...getImageInputProps()} />
                                    {isImageUploading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <p>Uploading thumbnail image...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {uploadedImageUrl ? (
                                                <div className="w-full h-full relative aspect-square">
                                                    <Image
                                                        src={uploadedImageUrl}
                                                        alt="Preview"
                                                        fill
                                                        className="object-contain"
                                                        priority
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-8 h-8 mb-4 text-muted-foreground" />
                                                    <p className="text-sm font-medium">
                                                        Drop thumbnail image here or click to select
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Supports PNG, JPG, GIF, WEBP
                                                    </p>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div
                                className={cn(
                                    "bg-background rounded-xl h-full",
                                    language === "glb" ? "p-2 w-[180px]" : "p-0 w-0 hidden"
                                )}
                            >
                                {language === "glb" && (
                                    <div
                                        {...getRootProps()}
                                        className={`border-2 border-dashed rounded-lg
                                            text-center cursor-pointer transition-colors
                                            h-full flex flex-col items-center justify-center
                                            ${uploadedGlbUrl ? "p-2" : "p-4"}
                                            ${
                                                isDragActive
                                                    ? "border-primary bg-primary/10"
                                                    : "border-muted-foreground/25"
                                            }
                                            ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                                    >
                                        <input {...getInputProps()} />
                                        {isUploading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <p>Uploading to IPFS...</p>
                                            </div>
                                        ) : (
                                            <>
                                                {uploadedGlbUrl ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                        <div className="w-full px-2">
                                                            <p className="text-sm font-medium">
                                                                Currently Uploaded:
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-1 w-[150px] truncate mx-auto">
                                                                {uploadedGlbUrl}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                                        <p className="text-sm font-medium">
                                                            Drop GLB file here or click to select
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Supports .glb files
                                                        </p>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Textarea
                                placeholder="Enter page description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-full bg-background rounded-xl flex-1 resize-none overflow-y-auto"
                            />
                        </div>

                        <div className="flex-1 min-h-0 rounded-2xl overflow-hidden">
                            {isEditorLoading ? (
                                <div className="w-full h-full bg-background rounded-2xl animate-pulse">
                                    <div className="flex h-full">
                                        {/* Line numbers skeleton */}
                                        <div className="w-[50px] h-full bg-muted/50 border-r border-muted-foreground/20">
                                            <div className="flex flex-col gap-2 p-4">
                                                {[...Array(15)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-5 h-4 bg-muted-foreground/20 rounded"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {/* Code content skeleton */}
                                        <div className="flex-1 p-4">
                                            <div className="flex flex-col gap-2">
                                                {[...Array(15)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "h-4 bg-muted-foreground/20 rounded",
                                                            i % 3 === 0
                                                                ? "w-[80%]"
                                                                : i % 3 === 1
                                                                ? "w-[60%]"
                                                                : "w-[40%]"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <CodeMirror
                                    value={content}
                                    basicSetup={{
                                        lineNumbers: true,
                                        highlightActiveLineGutter: true,
                                        highlightActiveLine: true,
                                    }}
                                    style={{ height: "100%", minHeight: "100%" }}
                                    height="100%"
                                    extensions={[getEditorExtension()]}
                                    theme={oneDark}
                                    onChange={(val) => setContent(val)}
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </div>
            <div className="flex-1 h-full rounded-4xl bg-none overflow-hidden flex flex-col">
                <CardContent className="p-0 flex-1 overflow-auto shadow-none outline-none border-0 ring-0 rounded-none">
                    <div className="w-full h-full bg-none rounded-none overflow-hidden">
                        <iframe
                            srcDoc={`
                                <style>
                                    ::-webkit-scrollbar { display: none; }
                                    * { -ms-overflow-style: none; scrollbar-width: none; }
                                    html, body { margin: 0; padding: 0; }
                                </style>
                                ${language === "html" ? content : compiledCode}
                            `}
                            className="w-full h-full border-0"
                            title="preview"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                </CardContent>
            </div>
        </div>
    );
}

const getGLBTemplate = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(45deg, #1e1e2d, #2d2d45);
            overflow: hidden;
        }
        model-viewer {
            width: 100vw;
            height: 100vh;
            --poster-color: transparent;
        }
    </style>
</head>
<body>
    <model-viewer
        src="https://ipfs.io/ipfs/QmPute6BHeBUVsccWJ5m5gPcqB8Up3v5am5ahZZX3jNT76"
        alt="Mr Shiba Inu"
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
    ></model-viewer>
</body>
</html>
  `;
};

const getReactTemplate = () => {
    return `
function MyComponent() {
  const [clickCount, setClickCount] = React.useState(0);
  const emojis = ["🌈", "🎭", "💫", "🚀", "🔥", "🎉", "😎", "✨"];
  const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

  React.useEffect(() => {
    // Prevent scrolling inside the iframe
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // Reset when unmounted
    };
  }, []);

  return (
    <div className="fancy-container">
      <h1>Welcome to the Fancy Page ✨</h1>
      <p>Click the button for a surprise!</p>
      <button className="glow-button" onClick={() => setClickCount(clickCount + 1)}>
        {randomEmoji()} Clicked {clickCount} times!
      </button>

      {/* Floating emojis */}
      <div className="floating emoji1">{randomEmoji()}</div>
      <div className="floating emoji2">{randomEmoji()}</div>
      <div className="floating emoji3">{randomEmoji()}</div>
      <div className="floating emoji4">{randomEmoji()}</div>

      {/* Styles */}
      <style>
        {\`
          /* Prevents scrolling */
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }

          /* Smooth Gradient Background */
          .fancy-container {
            text-align: center;
            font-family: "Comic Sans MS", sans-serif;
            background: linear-gradient(-45deg, #ff416c, #ff4b2b, #1e90ff, #3b5998);
            background-size: 400% 400%;
            animation: gradientBG 10s infinite alternate;
            color: white;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: fixed;
          }

          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }

          /* Floating Animation */
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0); }
          }

          .floating {
            position: absolute;
            font-size: 3rem;
            opacity: 0.5;
            animation: float 3s infinite ease-in-out;
          }

          .emoji1 { top: 10%; left: 20%; animation-duration: 4s; }
          .emoji2 { top: 30%; left: 70%; animation-duration: 6s; }
          .emoji3 { top: 70%; left: 10%; animation-duration: 5s; }
          .emoji4 { top: 80%; left: 80%; animation-duration: 3.5s; }

          /* Glowing Button */
          .glow-button {
            background: none;
            border: 2px solid white;
            padding: 15px 30px;
            font-size: 18px;
            color: white;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.8);
            transition: all 0.3s ease-in-out;
          }

          .glow-button:hover {
            background: white;
            color: #ff4b2b;
            box-shadow: 0px 0px 25px rgba(255, 255, 255, 1);
          }
        \`}
      </style>
    </div>
  );
}
  `;
};

const getHTMLTemplate = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web3 Page</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            background: linear-gradient(45deg, #2d2d45, #3d3d60);
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(to right, #7928CA, #FF0080);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p {
            font-size: 1.2rem;
            line-height: 1.6;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Web3</h1>
        <p>This is your decentralized webpage. Edit this content to create something amazing!</p>
    </div>
</body>
</html>`;
};

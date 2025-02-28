"use client";

import { useEffect, useState, useCallback } from "react";
import deployedContracts from "../contracts/deployedContracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useWriteContract } from "wagmi";
import { useDropzone } from "react-dropzone";
import { notification } from "@/utils/scaffold-eth";
import Image from "next/image";

export default function PageCreate() {
    const [content, setContent] = useState("<h1>Hello, Web3!</h1>");
    const [editedGLB, setEditedGLB] = useState(false);
    const [editedReact, setEditedReact] = useState(false);
    const [language, setLanguage] = useState("html");
    const [compiledCode, setCompiledCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [uploadedGlbUrl, setUploadedGlbUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isImageUploading, setIsImageUploading] = useState(false);

    const { writeContract } = useWriteContract();

    const createPage = async () => {
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
                address: deployedContracts[targetNetwork.id].OnchainWebServer_v8.address,
                abi: deployedContracts[targetNetwork.id].OnchainWebServer_v8.abi,
                functionName: "mintPage",
                args: [
                    (language === "jsx" || language === "tsx") ? compiledCode : content,
                    name,
                    description,
                    uploadedImageUrl
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
        if (language === "jsx" || language === "tsx") return javascript({ jsx: true, typescript: language === "tsx" });
        return html();
    };

    useEffect(() => {
        if (language === "jsx" || language === "tsx") {
            if (!content.trim().startsWith("function MyComponent()")) {
                setError("React component name should always be MyComponent");
            } else {
                setError(null);
            }
            try {
                const transformedCode = Babel.transform(
                    `
          function App() {
            ${content}
            return React.createElement(MyComponent);
          }
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
          `,
                    { presets: ["react", "env"] },
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
        if (language === "glb" && !editedGLB) {
            setContent(getGLBTemplate());
            setEditedGLB(true);
        }
    }, [language, editedGLB]);

    useEffect(() => {
        if ((language === "jsx" || language === "tsx") && !editedReact) {
            setContent(getReactTemplate());
            setEditedReact(true);
        }
    }, [language, editedReact]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
                setContent(prev => prev.replace(
                    /src="https?:\/\/[^\/]+\/ipfs\/[^"]+"/,
                    `src="${ipfsUrl}"`
                ));
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload GLB file");
        } finally {
            setIsUploading(false);
        }
    }, [language]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'model/gltf-binary': ['.glb'],
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

    const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
        onDrop: onImageDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        },
        maxFiles: 1,
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-2xl font-bold">Create Web3 Page</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="bg-muted px-4 py-2 rounded-lg text-sm font-medium">
                            Cost: 0.01 ETH
                        </div>
                        <Button
                            onClick={createPage}
                            disabled={isLoading}
                            className="min-w-[160px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Deploy to Blockchain"
                            )}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Select
                                    value={language}
                                    onValueChange={(value) => setLanguage(value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="html">HTML</SelectItem>
                                        <SelectItem value="jsx">JavaScript (JSX)</SelectItem>
                                        <SelectItem value="tsx">TypeScript (TSX)</SelectItem>
                                        <SelectItem value="glb">GLB</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    placeholder="Enter page name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="flex-1"
                                />
                            </div>

                            <Textarea
                                placeholder="Enter page description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[100px]"
                            />

                            {/* Image Upload Section */}
                            <div
                                {...getImageRootProps()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                                    ${isImageDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"}
                                    ${isImageUploading ? "opacity-50 pointer-events-none" : ""}`}
                            >
                                <input {...getImageInputProps()} />
                                <ImageIcon className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                                {isImageUploading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <p>Uploading thumbnail image...</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium">
                                            {uploadedImageUrl ? "Drop to replace thumbnail image" : "Drop thumbnail image here or click to select"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {uploadedImageUrl ? (
                                                <Image src={uploadedImageUrl} alt="Preview" className="mt-2 mx-auto" width={1024} height={1024} />
                                            ) : (
                                                "Supports PNG, JPG, GIF, WEBP"
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* GLB file url */}
                            {language === "glb" && uploadedGlbUrl && (
                                <Alert>
                                    <AlertDescription className="break-all">
                                        Uploaded GLB URL: {uploadedGlbUrl}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {language === "glb" && (
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"}
                    ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                                    {isUploading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <p>Uploading to IPFS...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium">
                                                {uploadedGlbUrl ? "Drop to replace GLB file" : "Drop GLB file here or click to select"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {uploadedGlbUrl ? "Current: " + uploadedGlbUrl : "Supports .glb files"}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="border rounded-lg overflow-hidden">
                                <CodeMirror
                                    value={content}
                                    height="calc(100vh - 32rem)"
                                    extensions={[getEditorExtension()]}
                                    theme={oneDark}
                                    onChange={(val) => setContent(val)}
                                />
                            </div>
                        </div>

                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 aspect-square">
                                <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                                    <iframe
                                        srcDoc={language === "html" ? content : compiledCode}
                                        className="w-full h-full border-0"
                                        title="preview"
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const getGLBTemplate = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer"></script>
</head>
<body style="margin: 0; overflow: hidden; background: black;">
    <model-viewer
        src="https://ipfs.io/ipfs/QmPute6BHeBUVsccWJ5m5gPcqB8Up3v5am5ahZZX3jNT76"
        alt="Mr Shiba Inu"
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        style="width: 100vw; height: 100vh;"
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

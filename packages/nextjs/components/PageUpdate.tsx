"use client";

import { useCallback, useEffect, useState } from "react";
import deployedContracts from "../contracts/deployedContracts";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageIcon, Loader2, Upload, RefreshCcw } from "lucide-react";
import * as Babel from "@babel/standalone";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import { useReadContract, useWriteContract } from "wagmi";
import { useTargetNetwork } from "@/hooks";
import { Textarea } from "./ui/textarea";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { notification } from "@/utils/scaffold-eth";
import { cn } from "@/lib/utils";

export default function PageUpdate() {
    const [content, setContent] = useState(`<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: system-ui, -apple-system, sans-serif;
        }
        h3 {
            color: #000;
            text-align: center;
        }
    </style>
</head>
<body>
    <h3>Please load your page content</h3>
</body>
</html>`);
    const [editedGLB, setEditedGLB] = useState(false);
    const [pageId, setPageId] = useState(0);
    const [language, setLanguage] = useState("html");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [compiledCode, setCompiledCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { targetNetwork } = useTargetNetwork();
    const [uploadedGlbUrl, setUploadedGlbUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [isEditorLoading, setIsEditorLoading] = useState(true);

    const { writeContract } = useWriteContract();
    const { refetch } = useReadContract({
        address:
            deployedContracts[targetNetwork.id as keyof typeof deployedContracts]
                .OnchainWebServerMetadata_v2.address,
        functionName: "pages",
        abi: deployedContracts[targetNetwork.id as keyof typeof deployedContracts]
            .OnchainWebServerMetadata_v2.abi,
        args: [BigInt(pageId)],
        chainId: targetNetwork.id,
        query: {
            enabled: false,
            retry: false,
        },
    });

    const updatePage = async () => {
        if (!content.trim()) {
            setError("Please enter some content");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await writeContract({
                address:
                    deployedContracts[targetNetwork.id as keyof typeof deployedContracts]
                        .OnchainWebServerMetadata_v2.address,
                abi: deployedContracts[targetNetwork.id as keyof typeof deployedContracts]
                    .OnchainWebServerMetadata_v2.abi,
                functionName: "updatePage",
                args: [
                    BigInt(pageId),
                    language === "jsx" || language === "tsx" ? compiledCode : content,
                    name,
                    description,
                    uploadedImageUrl || "",
                ],
            });
            setError(null);
        } catch (error) {
            console.error("Error updating page:", error);
            setError("Failed to update page. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadPage = async () => {
        try {
            const { data } = await refetch();
            if (data) {
                setContent(data[0]);
                setName(data[1]);
                setDescription(data[2]);
                setUploadedImageUrl(data[3]);
                setError(null);
            } else {
                setError("Page not found");
            }
        } catch (err) {
            console.error("Error loading page:", err);
            setError("Failed to load page");
        }
    };

    const getEditorExtension = () => {
        if (language === "html" || language === "glb") return html();
        if (language === "jsx" || language === "tsx")
            return javascript({ jsx: true, typescript: language === "tsx" });
        return html();
    };

    useEffect(() => {
        if (language === "jsx" || language === "tsx") {
            try {
                const transformedCode = Babel.transform(
                    `
          function App() {
            ${content}
            return React.createElement(MyComponent);
          }
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
          `,
                    { presets: ["react", "env"] }
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
            "video/*": [".webm"],
        },
        maxFiles: 1,
    });

    useEffect(() => {
        // Short timeout to ensure CodeMirror is mounted
        const timer = setTimeout(() => {
            setIsEditorLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

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
                            Update Your Nauti Page
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <div className="flex gap-0 rounded-xl">
                            <Input
                                type="text"
                                value={pageId || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || /^\d+$/.test(value)) {
                                        setPageId(value === "" ? 0 : Number(value));
                                    }
                                }}
                                className={`w-24 rounded-none rounded-l-xl h-7
                                        bg-background/50
                                        !border-0 !outline-none !ring-0
                                        !focus:border-0 !focus:outline-none !focus:ring-0
                                        !focus-within:border-0 !focus-within:outline-none !focus-within:ring-0
                                        !active:border-0 !active:outline-none !active:ring-0
                                        !hover:border-0 !hover:outline-none !hover:ring-0
                                        `}
                                placeholder="Page ID"
                            />
                            <Button
                                onClick={loadPage}
                                disabled={isLoading}
                                className="bg-chart-2 h-7 px-2 rounded-none rounded-r-xl hover:bg-chart-3 hover:text-white"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <RefreshCcw className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <div className="bg-background h-7 px-3 flex items-center rounded-xl text-sm font-medium">
                            Cost: 0.01 ETH
                        </div>
                        <Button
                            onClick={updatePage}
                            disabled={isLoading}
                            className="min-w-[90px] bg-chart-4/90 h-7 px-1 rounded-xl hover:bg-chart-3 hover:text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Page"
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
                                <SelectContent>
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
                    <div className="w-full h-full bg-background/20 rounded-none overflow-hidden">
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

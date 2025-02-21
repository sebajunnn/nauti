"use client";

import { useEffect, useState } from "react";
import deployedContracts from "../contracts/deployedContracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import * as Babel from "@babel/standalone";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import { useReadContract, useWriteContract } from "wagmi";
import { useTargetNetwork } from "@/hooks";

export default function PageUpdate() {
  const [content, setContent] = useState("<h1>Hello, Web3!</h1>");
  const [pageId, setPageId] = useState(0);
  const [language, setLanguage] = useState("html");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [compiledCode, setCompiledCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { targetNetwork } = useTargetNetwork();

  const { writeContract } = useWriteContract();
  const { data: pageData, refetch } = useReadContract({
    address: deployedContracts[31337].OnchainWebServer_v5.address,
    functionName: "getPage",
    abi: deployedContracts[31337].OnchainWebServer_v5.abi,
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
        address: deployedContracts[31337].OnchainWebServer_v5.address,
        abi: deployedContracts[31337].OnchainWebServer_v5.abi,
        functionName: "updatePage",
        args: [BigInt(pageId), (language === "jsx" || language === "tsx") ? compiledCode : content, name, description],
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
        setContent(data.content);
        setName(data.name);
        setDescription(data.description);
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
    if (language === "jsx" || language === "tsx") return javascript({ jsx: true, typescript: language === "tsx" });
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Update Web3 Page</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Input
                type="number"
                value={pageId}
                onChange={e => setPageId(Number(e.target.value))}
                className="w-24"
                placeholder="Page ID"
                min="0"
              />
              <Button
                variant="secondary"
                onClick={loadPage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load Page"
                )}
              </Button>
            </div>
            <div className="bg-muted px-4 py-2 rounded-lg text-sm font-medium">
              Cost: 0.01 ETH
            </div>
            <Button
              onClick={updatePage}
              disabled={isLoading}
              className="min-w-[160px]"
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
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Enter page name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1"
                />
              </div>

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
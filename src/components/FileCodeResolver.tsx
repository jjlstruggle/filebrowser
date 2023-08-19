import { useState } from "react";
import Editor from "react-monaco-editor";
import { Tree } from "@/pages/api/tree";
import { Button, Space, Typography } from "@arco-design/web-react";

const languages = {
  json: "json",
  md: "markdown",
  css: "css",
  ts: "typescript",
  js: "javascript",
  html: "html",
  scss: "scss",
  less: "less",
};

export default function FileCodeResolver({
  code,
  setCurrentFolder,
  setFoldStack,
  foldStack,
  currentFolder,
}: {
  code: string;
  currentFolder: Tree;
  setCurrentFolder: (tree: Tree) => void;
  foldStack: Tree[];
  setFoldStack: (foldStack: Tree[]) => void;
}) {
  const [value, setValue] = useState(code);
  const name = currentFolder.dir;
  const extension = name.split(".").at(-1)!;

  return (
    <div style={{ height: "calc(100vh - 8rem)" }}>
      <Space className="px-4 mt-2" size="medium">
        <Typography.Title heading={6}>{currentFolder.dir}</Typography.Title>
        <Button
          size="mini"
          type="primary"
          onClick={() => {
            foldStack.pop();
            setCurrentFolder(foldStack.at(-1)!);
            setFoldStack([...foldStack]);
          }}
        >
          退出
        </Button>
        {value !== code && (
          <Button size="mini" type="primary">
            保存
          </Button>
        )}
        {value !== code && (
          <Button size="mini" type="primary">
            保存并退出
          </Button>
        )}
      </Space>
      <div className="px-4 py-2 h-full">
        <Editor
          // @ts-ignore
          language={languages[extension] || ""}
          theme="vs-dark"
          value={value}
          onChange={(e) => setValue(e)}
        />
      </div>
    </div>
  );
}

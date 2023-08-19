import {
  Button,
  Divider,
  Input,
  Layout,
  Modal,
  Space,
  Tooltip,
  Upload,
} from "@arco-design/web-react";
import {
  IconDownload,
  IconExport,
  IconFile,
  IconFolder,
  IconFolderAdd,
  IconSettings,
  IconUpload,
} from "@arco-design/web-react/icon";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { Tree } from "./api/tree";
import { useState } from "react";
import FolderResolver from "@/components/FolderResolver";
import dynamic from "next/dynamic";
import download from "downloadjs";
import axios from "axios";

const FileCodeResolver = dynamic(
  () => import("@/components/FileCodeResolver"),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

export const getServerSideProps: GetServerSideProps<{
  tree: Tree;
}> = async () => {
  const res = await fetch("http://localhost:3000/api/tree");
  const data = await res.json();
  return { props: { tree: data } };
};

export default function Home({
  tree,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [currentFolder, setCurrentFolder] = useState(tree);
  const [code, setCode] = useState("");
  const [foldStack, setFoldStack] = useState([tree]);
  const [uploadModal, setUploadModal] = useState(false);
  const resolver = currentFolder.type;

  const handleDownload = async () => {
    if (currentFolder.type === "folder") {
      const data = await axios.post(
        "/api/download",
        {
          dir: currentFolder.path,
        },
        { responseType: "blob" }
      );
      download(data.data, `${currentFolder.dir}.zip`);
    } else {
      const data = await axios.post(
        "/api/download",
        {
          dir: currentFolder.path,
        },
        { responseType: "blob" }
      );
      download(data.data, currentFolder.dir);
    }
  };

  return (
    <Layout className="w-screen h-screen">
      <Modal visible={uploadModal} onCancel={() => setUploadModal(false)}>
        <Upload multiple drag className="my-4" autoUpload={false} />
      </Modal>
      <Layout.Header className="shadow-md py-3 flex justify-between  px-12 h-16">
        <Input.Search
          className="flex-1 mr-12 max-w-2xl"
          placeholder="在当前文件夹搜索..."
        ></Input.Search>
        <Space size="medium">
          {/* <Tooltip content="删除文件">
            <Button
              size="large"
              type="primary"
              icon={<IconDelete />}
              iconOnly
            />
          </Tooltip> */}
          <Tooltip content="下载文件">
            <Button
              onClick={handleDownload}
              size="large"
              type="primary"
              icon={<IconDownload />}
              iconOnly
            />
          </Tooltip>
          <Tooltip content="上传文件">
            <Button
              onClick={() => setUploadModal(true)}
              size="large"
              type="primary"
              icon={<IconUpload />}
              iconOnly
            />
          </Tooltip>
        </Space>
      </Layout.Header>
      <Layout style={{ marginTop: 2 }}>
        <Layout.Sider>
          <Button
            icon={<IconFolder className="text-xl" />}
            className="w-full py-4 h-auto text-lg flex items-center"
          >
            根文件夹
          </Button>
          <Divider className="m-0" />
          <Button
            icon={<IconFile className="text-xl" />}
            className="w-full py-4 h-auto text-lg flex items-center"
          >
            新建文件
          </Button>
          <Button
            className="w-full py-4 h-auto text-lg flex items-center"
            icon={<IconFolderAdd className="text-xl" />}
          >
            新建文件夹
          </Button>
          <Divider className="m-0" />
          <Button
            icon={<IconSettings className="text-xl" />}
            className="w-full py-4 h-auto text-lg flex items-center"
          >
            设置
          </Button>
          <Button
            icon={<IconExport className="text-xl" />}
            className="w-full py-4 h-auto text-lg flex items-center"
          >
            退出
          </Button>
        </Layout.Sider>
        <Layout.Content className="h-full">
          {resolver === "folder" ? (
            <FolderResolver
              tree={tree}
              currentFolder={currentFolder}
              setCurrentFolder={(tree) => setCurrentFolder(tree)}
              foldStack={foldStack}
              setFoldStack={(foldStack) => setFoldStack(foldStack)}
              setCode={(code) => setCode(code)}
            />
          ) : resolver === "file" ? (
            <FileCodeResolver
              code={code}
              currentFolder={currentFolder}
              setCurrentFolder={(tree) => setCurrentFolder(tree)}
              foldStack={foldStack}
              setFoldStack={(foldStack) => setFoldStack(foldStack)}
            />
          ) : null}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

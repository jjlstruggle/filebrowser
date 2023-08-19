import { Space, Table, TableColumnProps } from "@arco-design/web-react";
import { IconArrowUp, IconFile, IconFolder } from "@arco-design/web-react/icon";
import { Tree } from "@/pages/api/tree";
import { useState } from "react";
import { useAsyncEffect, useUpdate } from "ahooks";
import dayjs from "dayjs";
import size from "@/utils/size";
import axios from "axios";

export default function FolderResolver({
  currentFolder,
  setCurrentFolder,
  setFoldStack,
  foldStack,
  tree,
  setCode,
}: {
  tree: Tree;
  currentFolder: Tree;
  setCurrentFolder: (tree: Tree) => void;
  foldStack: Tree[];
  setFoldStack: (foldStack: Tree[]) => void;
  setCode: (code: string) => void;
}) {
  const [updateToken, setUpdateToken] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string>>([]);

  const update = useUpdate();
  const refreshFileInfo = () => setUpdateToken((token) => token + 1);

  const columns: TableColumnProps[] = [
    {
      dataIndex: "dir",
      title: "文件名",
      render(col, origin: Tree) {
        if (origin.type === "folder") {
          return (
            <Space className="text-lg">
              <IconFolder />
              {col}
            </Space>
          );
        } else if (origin.type === "file") {
          return (
            <Space className="text-lg">
              <IconFile />
              {col}
            </Space>
          );
        } else {
          return (
            <Space className="text-lg">
              <IconArrowUp />
              {col}
            </Space>
          );
        }
      },
    },
    {
      dataIndex: "size",
      title: "文件大小",
      render(col, origin: Tree) {
        if (origin.type == "folder") return "--";
        else if (origin.type == "others") return "--";
        return origin.size === "waiting" ? "正在计算" : origin.size;
      },
    },
    {
      dataIndex: "modified_date",
      title: "最新修改日期",
      render(col, origin: Tree) {
        if (origin.type == "others") return "--";
        return origin.modified_date === "waiting"
          ? "正在计算"
          : origin.modified_date;
      },
    },
  ];

  useAsyncEffect(async () => {
    const res = await axios.post("/api/measure", { dir: currentFolder.path });
    const data = res.data;
    currentFolder.children.forEach((child) => {
      if (child.type === "file") {
        child.size = size(data[child.dir].size);
      }
      child.modified_date = dayjs(data[child.dir].modified_date).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    });
    setCurrentFolder({ ...currentFolder });
    update();
  }, [updateToken]);

  return (
    <Table
      rowSelection={{
        type: "checkbox",
        selectedRowKeys,
        onChange: (selectedRowKeys) => {
          setSelectedRowKeys(selectedRowKeys as string[]);
        },
      }}
      onRow={(record: Tree) => ({
        onDoubleClick: async (event) => {
          if (record.type === "folder") {
            foldStack.push(record);
            setCurrentFolder(record);
            refreshFileInfo();
            setFoldStack([...foldStack]);
          } else if (record.type === "others") {
            foldStack.pop();
            setCurrentFolder(foldStack.at(-1)!);
            refreshFileInfo();
            setFoldStack([...foldStack]);
          } else {
            const res = await axios.post<{ text: string }>("/api/getFileCode", {
              dir: record.path,
            });
            foldStack.push(record);
            setCode(res.data.text);
            setCurrentFolder(record);
            setFoldStack([...foldStack]);
          }
        },
      })}
      rowKey="path"
      rowClassName={() => "cursor-pointer"}
      className="h-full"
      border
      hover
      scroll={{ y: "calc(100vh - 8rem)" }}
      childrenColumnName="$"
      pagination={false}
      columns={columns}
      // @ts-ignore
      data={
        currentFolder.path === tree.path
          ? currentFolder.children
          : [
              {
                dir: "返回上一级",
                size: "waiting",
                modified_date: "waiting",
                children: [],
                type: "others",
                path: "$",
              },
              // @ts-ignore
            ].concat(currentFolder.children)
      }
    ></Table>
  );
}

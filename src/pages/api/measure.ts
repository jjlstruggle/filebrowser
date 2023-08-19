import type { NextApiRequest, NextApiResponse } from "next";
import { readdirSync, statSync } from "fs";
import { resolve } from "path";

type FileInfo = Record<string, { size: number; modified_date: number }>;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<FileInfo>
) {
  const { dir } = req.body;

  let data: FileInfo = {};
  const childrenPath = readdirSync(dir, {
    withFileTypes: true,
    encoding: "utf8",
  });
  childrenPath.forEach((child) => {
    const info = statSync(resolve(dir, child.name));
    data[child.name] = {
      size: info.size,
      modified_date: info.mtime.getTime(),
    };
  });

  res.status(200).json(data);
}

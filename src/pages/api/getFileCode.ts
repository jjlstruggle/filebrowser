import type { NextApiRequest, NextApiResponse } from "next";
import { readFileSync } from "fs";
import { basename } from "path";
import minetype from "mime-types";

const loader = [
  "js",
  "ts",
  "py",
  "txt",
  "c++",
  "jsx",
  "tsx",
  "vue",
  "json",
  "gitignore",
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ text: string }>
) {
  const { dir } = req.body;
  const base = basename(dir);
  const extension = base.split(".").at(-1)!;

  let str = "";
  if (
    loader.includes(extension) ||
    minetype.lookup(base).toString().includes("text")
  ) {
    str = readFileSync(dir, "utf8");
  }

  res.status(200).json({
    text: str,
  });
}

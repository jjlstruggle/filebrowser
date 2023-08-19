import type { NextApiRequest, NextApiResponse } from "next";
import { readFileSync, readdirSync, statSync } from "fs";
import { basename, resolve } from "path";
import archiver from "archiver";
import getConfig from "next/config";
import format from "gray-matter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { serverRuntimeConfig } = getConfig();
  const config = format(readFileSync(serverRuntimeConfig.configPath, "utf8"));
  const ignores: Array<string> = config.data.ignores;
  const { dir } = req.body;
  const name = basename(dir);
  const info = statSync(dir);
  if (info.isDirectory()) {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${name.split(".")[0]}.zip`
    );
    const zip = archiver("zip", { zlib: { level: 9 } });
    const children = readdirSync(dir, {
      withFileTypes: true,
      encoding: "utf8",
    });
    children
      .filter((dir) => !ignores.includes(dir.name))
      .forEach((childrenDir) => {
        let path = resolve(dir, childrenDir.name);
        if (childrenDir.isDirectory()) {
          zip.directory(path, false);
        } else {
          zip.file(path, { name: basename(path) });
        }
      });

    zip.pipe(res);
    await zip.finalize();
    res.status(200);
    res.end();
  } else {
    res.status(200).send(readFileSync(dir, "binary"));
  }
}

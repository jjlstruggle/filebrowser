import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { readdirSync, readFileSync } from "fs";
import { basename, resolve } from "path";
import { cwd } from "process";
import parseArgv from "arg";
import format from "gray-matter";

export type Tree = {
  path: string;
  children: Tree[];
  type: "folder" | "file" | "others";
  dir: string;
  size: number | string;
  modified_date: number | string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tree>
) {
  const { serverRuntimeConfig } = getConfig();
  const config = format(readFileSync(serverRuntimeConfig.configPath, "utf8"));
  const ignores: Array<string> = config.data.ignores;

  const presentDirectory = cwd();
  const args = parseArgv({
    "--help": Boolean,
    "--version": Boolean,
    "--config": String,
    "--no-compression": Boolean,
    "--path": String,
    "--port": Boolean,
    "-h": "--help",
    "-v": "--version",
    "-c": "--config",
    "-u": "--no-compression",
    "-ph": "--path",
    "-pt": "--port",
  });

  let directoryToServe = "";
  if (args["--path"]) {
    directoryToServe = args["--path"];
  } else {
    directoryToServe = presentDirectory;
  }

  function deepReadDirectory(parentPath: string): Tree {
    const childrenPath = readdirSync(parentPath, {
      withFileTypes: true,
      encoding: "utf8",
    });

    let child = childrenPath
      .filter((dir) => !ignores.includes(dir.name))
      .map<Tree>((childrenDir) => {
        let path = resolve(parentPath, childrenDir.name);
        if (childrenDir.isDirectory()) {
          return deepReadDirectory(path);
        } else if (childrenDir.isFile()) {
          return {
            path,
            children: [],
            type: "file",
            dir: childrenDir.name,
            size: "waiting",
            modified_date: "waiting",
          };
        } else {
          return {
            path,
            children: [],
            type: "file",
            dir: childrenDir.name,
            size: "waiting",
            modified_date: "waiting",
          };
        }
      });

    return {
      path: parentPath,
      children: child,
      type: "folder",
      dir: basename(parentPath),
      size: "waiting",
      modified_date: "waiting",
    };
  }

  const tree = deepReadDirectory(directoryToServe);
  res.status(200).json(tree);
}

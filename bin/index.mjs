#!/usr/bin/env node
import { cwd } from "process";
import { accessSync, constants } from "fs";
import { createServer } from "http";
import { parse } from "url";

import next from "next";
import chalk from "chalk";
import parseArgv from "arg";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const log = console.log;

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

try {
  accessSync(directoryToServe, constants.R_OK | constants.W_OK);
} catch (e) {
  log(chalk.red(`${directoryToServe} is not a directory`));
  process.exit(0);
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      log(`> Ready on http://${hostname}:${port}`);
    });
});

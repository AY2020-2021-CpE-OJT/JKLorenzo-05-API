import fs from "fs";
import path from "path";

export function getFiles(dir: string): string[] {
  return fs.readdirSync(dir).reduce<string[]>((list, file) => {
    const name = path.join(dir, file);
    const isDir = fs.statSync(name).isDirectory();
    return list.concat(isDir ? getFiles(name) : [name]);
  }, []);
}

export function safeFormat(data: string): string {
  return data.split("  ").join("").trim();
}

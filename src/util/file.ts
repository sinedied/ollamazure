import { join } from 'node:path';
import fs from 'node:fs/promises';

export type PackageJson = Record<string, any> & {
  name: string;
  version: string;
};

export async function getPackageJson(basePath: string): Promise<PackageJson> {
  const file = await fs.readFile(join(basePath, 'package.json'), 'utf8');
  const package_ = JSON.parse(file) as PackageJson;
  return package_;
}

export async function pathExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDirectory(path: string) {
  await fs.mkdir(path, { recursive: true });
}

export async function readFile(file: string) {
  return fs.readFile(file, 'utf8');
}

export function removeFirstPosixPathSegment(filePath: string): string {
  return filePath.split('/').slice(1).join('/');
}

export function convertPathToPosix(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}

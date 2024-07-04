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

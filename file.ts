import { resolve } from 'path';
import { readdir } from 'fs/promises';
import { Dirent } from 'fs';

export function resolvePath(inputPath: string): string {
    return inputPath.startsWith('/') ? inputPath : resolve(process.cwd(), inputPath);
}

export async function listFiles(directory: string = '.'): Promise<string[]> {
    try {
        const items = await readdir(directory, { withFileTypes: true });
        return items
            .filter(item => !item.name.startsWith('.'))
            .map(item => item.name)
            .sort();
    } catch (error) {
        throw new Error(`Failed to list files: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await Bun.file(filePath).text();
        return true;
    } catch {
        return false;
    }
}
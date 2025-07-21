import { CLIPlugin } from './plugin.interface';
import { LMStudioClient } from '../lm-client';
import { readdir } from 'fs/promises';
import { join } from 'path';

async function getDirectoryStructure(dirPath: string, indent = ''): Promise<string> {
    let structure = '';
    try {
        const items = await readdir(dirPath, { withFileTypes: true });
        for (const item of items) {
            if (item.name.startsWith('.') || item.name === 'node_modules') continue;
            
            structure += `${indent}${item.name}${item.isDirectory() ? '/' : ''}\n`;

            if (item.isDirectory()) {
                structure += await getDirectoryStructure(join(dirPath, item.name), `${indent}  `);
            }
        }
    } catch (error) {
    }
    return structure;
}

async function explainAction(client: LMStudioClient, args: any[]) {
    const [dirPath = '.'] = args;

    try {
        const resolvedPath = join(process.cwd(), dirPath);
        console.log(`\n📁 Analyzing structure of: ${resolvedPath}`);
        const structure = await getDirectoryStructure(resolvedPath);

        if (!structure) {
            console.log('\n⚠️ Could not read directory structure or directory is empty.');
            return;
        }
        
        const systemPrompt = 'You are a software architecture expert. Analyze the provided project structure and give valuable insights.'
        
        const message = [
            'Analyze this project structure:',
            '```',
            structure,
            '```',
            '',
            'Provide a concise analysis on:',
            '1. The probable purpose of the project and technologies used.',
            '2. The file organization and architecture (e.g., MVC, modular, etc.).',
            '3. Positive points and possible suggestions for improvement in the structure.'
        ].join('\n');
        
        const analysis = await client.sendMessage(message, systemPrompt);
        console.log('\n📊 Directory analysis:\n');
        console.log(analysis);

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Directory analysis failed:`, message);
    }
}

const ExplainPlugin: CLIPlugin = {
    name: 'explain [directory]',
    description: 'Analyzes a directory structure and explains its architecture.',
    action: explainAction
};

export default ExplainPlugin;
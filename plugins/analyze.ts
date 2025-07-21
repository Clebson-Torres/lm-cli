import { CLIPlugin } from './plugin.interface';
import { LMStudioClient } from '../lm-client';
import { readFile } from 'fs/promises';
import { join } from 'path';

async function analyzeAction(client: LMStudioClient, args: any[]) {
    const [filePath] = args;
    if (!filePath) {
        console.error('\n❌ Error: File path is required.');
        return;
    }

    try {
        const absolutePath = join(process.cwd(), filePath);
        const code = await readFile(absolutePath, 'utf-8');
        
        const systemPrompt = [
            'You are a code analysis expert.',
            'Analyze the provided code and give detailed and constructive feedback.'
        ].join(' ');
        
        const message = [
            'Analyze the following code:',
            '1. Summary of what it does',
            '2. Possible improvements',
            '3. Identified problems',
            '4. Optimization suggestions',
            '',
            `Code (${filePath}):`,
            '```',
            code,
            '```'
        ].join('\n');
        
        const analysis = await client.sendMessage(message, systemPrompt);
        console.log('\n🔍 Analysis:\n');
        console.log(analysis);

    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            console.error(`\n❌ Error: File not found at '${filePath}'.`);
        } else {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`\n❌ Error analyzing:`, message);
        }
    }
}

const AnalyzePlugin: CLIPlugin = {
    name: 'analyze <file>',
    description: 'Analyzes a code file and provides feedback.',
    action: analyzeAction
};

export default AnalyzePlugin;
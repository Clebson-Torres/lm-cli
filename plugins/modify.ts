import { CLIPlugin } from './plugin.interface';
import { LMStudioClient } from '../lm-client';
import { join } from 'path';

function cleanCodeResponse(text: string): string {
    const lines = text.split('\n');
    if (lines.length > 1 && lines[0].trim().startsWith('```')) {
        return lines.slice(1, -1).join('\n');
    }
    return text;
}

async function modifyAction(client: LMStudioClient, args: any[]) {
    const [filePath, instruction] = args;
    if (!filePath || !instruction) {
        console.error('\n❌ Error: File path and instruction are required.');
        return;
    }

    try {
        const resolvedPath = join(process.cwd(), filePath);
        const file = Bun.file(resolvedPath);
        
        if (!await file.exists()) {
            console.error(`\n❌ Error: File not found at '${resolvedPath}'.`);
            return;
        }

        const content = await file.text();
        const backupPath = `${resolvedPath}.backup`;

        await Bun.write(backupPath, content);
        console.log(`\n💾 Backup of original file created at: ${backupPath}`);

        const systemPrompt = 'You are an expert programmer. Modify the provided code to meet the instruction, maintaining functionality and good practices.';
        const message = [
            `Modify the following code according to the instruction: "${instruction}"`,
            '',
            `Current code in file '${filePath}':`,
            '```',
            content,
            '```',
            '',
            'Provide ONLY the modified code, no explanations or additional text.'
        ].join('\n');

        console.log(`\n✏️  Modifying ${filePath}...`);
        let newContent = await client.sendMessage(message, systemPrompt);
        newContent = cleanCodeResponse(newContent);

        await Bun.write(resolvedPath, newContent);
        console.log(`\n✅ File modified successfully!`);

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Error modifying:`, message);
    }
}

const ModifyPlugin: CLIPlugin = {
    name: 'modify <file> <instruction>',
    description: 'Modifies an existing file based on an instruction.',
    action: modifyAction
};

export default ModifyPlugin;
import { CLIPlugin, CommandOption } from './plugin.interface';
import { LMStudioClient } from '../lm-client';
import { join } from 'path';

function cleanCodeResponse(text: string): string {
    const lines = text.split('\n');
    if (lines.length > 1 && lines[0].trim().startsWith('```')) {
        return lines.slice(1, -1).join('\n');
    }
    return text;
}

async function generateAction(client: LMStudioClient, args: any[], options: any) {
    const [description] = args;
    if (!description) {
        console.error('\n❌ Error: Code description is required.');
        return;
    }

    try {
        const systemPrompt = `You are an expert programmer in ${options.language}. Generate clean, functional, and well-documented code.`

        const message = [
            `Create ${options.language} code for: ${description}`,
            'Requirements:',
            '1. Functional and well-structured code',
            '2. Explanatory comments',
            '3. Error handling',
            '4. Good programming practices',
            '5. Necessary imports',
            '',
            'Provide ONLY the code, no explanations.'
        ].join('\n');

        console.log('\n✨ Generating code...');
        let code = await client.sendMessage(message, systemPrompt);
        code = cleanCodeResponse(code);

        if (options.output) {
            const outputPath = join(process.cwd(), options.output);
            await Bun.write(outputPath, code);
            console.log(`\n✅ Code saved to: ${outputPath}`);
        } else {
            console.log('\n✨ Generated code:\n');
            console.log(code);
        }

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Error generating:`, message);
    }
}

const generateOptions: CommandOption[] = [
    {
        flags: '-l, --language <lang>',
        description: 'Programming language to use',
        defaultValue: 'typescript'
    },
    {
        flags: '-o, --output <file>',
        description: 'Save generated code to an output file'
    }
];

const GeneratePlugin: CLIPlugin = {
    name: 'generate <description>',
    description: 'Generates code from a textual description.',
    options: generateOptions,
    action: generateAction
};

export default GeneratePlugin;
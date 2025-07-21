import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { LMStudioClient } from './lm-client';
import { readdir } from 'fs/promises';

import AnalyzePlugin from './plugins/analyze';
import GeneratePlugin from './plugins/generate';
import ModifyPlugin from './plugins/modify';
import ExplainPlugin from './plugins/explain';

const commands = {
    analyze: AnalyzePlugin,
    generate: GeneratePlugin,
    modify: ModifyPlugin,
    explain: ExplainPlugin,
};

async function listFiles(directory: string = '.'): Promise<string[]> {
    try {
        const items = await readdir(directory, { withFileTypes: true });
        return items
            .filter(item => !item.name.startsWith('.'))
            .map(item => item.name)
            .sort();
    } catch (error) {
        console.error('\n❌ Error listing files:', error);
        return [];
    }
}

export async function interactiveMode(client: LMStudioClient) {
    const rl = readline.createInterface({
        input: stdin,
        output: stdout,
        prompt: 'lmcli> '
    });

    console.log(`
    ╔══════════════════════════════════╗
    ║    LM Studio CLI - Interactive   ║
    ╚══════════════════════════════════╝
    `);

    const { connected, message } = await client.checkConnection();
    console.log(`🔌 ${message}\n`);

    if (!connected) {
        console.log(`        To set up:
        1. Open LM Studio
        2. Load a model
        3. Enable 'Local Server' (port 1234)
        `);
        rl.close();
        return;
    }

    showHelp();
    rl.prompt();

    rl.on('line', async (input) => {
        try {
            const trimmedInput = input.trim();

            if (!trimmedInput) {
                rl.prompt();
                return;
            }

            const [commandName, ...args] = trimmedInput.split(/\s+/);

            switch (commandName.toLowerCase()) {
                case 'quit':
                case 'exit':
                case 'q':
                    console.log('Goodbye! 👋');
                    rl.close();
                    break;

                case 'help':
                case 'h':
                    showHelp();
                    break;

                case 'clear':
                case 'cls':
                    console.clear();
                    break;

                case 'list':
                case 'ls':
                case 'dir':
                    const files = await listFiles();
                    console.log('\n📂 Available files:\n');
                    console.log(files.length ? files.join('\n') : 'No files found');
                    break;

                default:
                    const command = commands[commandName as keyof typeof commands];
                    if (command) {
                        const commandArgs = trimmedInput.substring(commandName.length).trim().split(/\s+/);
                        await command.action(client, commandArgs, {});
                    } else if (trimmedInput) {
                        console.log('\n💭 Processing as chat...');
                        const response = await client.sendMessage(trimmedInput);
                        console.log('\n🤖 Response:\n');
                        console.log(response);
                    } else {
                    }
                    break;
            }
        } catch (error) {
            console.error('\n❌ Unexpected error in interactive mode:', error);
        }
        rl.prompt();
    });

    rl.on('close', () => {
        process.exit(0);
    });
}

function showHelp() {
    console.log(`
    Available Commands:
    
    📁 Files:
    - analyze <file>          Analyzes a code file
    - generate <description>  Generates code based on description
    - modify <file> <instruction> Modifies an existing file
    - explain [directory]     Analyzes directory structure
    - list/ls                 Lists available files
    
    ⚙️  Utilities:
    - clear/cls               Clears the screen
    - help/h                  Shows this help message
    - quit/exit/q             Exits the program
    
    💬 Chat:
    - <any text>              Sends direct message to LM Studio
    `);
}
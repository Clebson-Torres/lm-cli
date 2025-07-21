import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { LMStudioClient } from './lm-client';
import { readdir } from 'fs/promises';

// Importa os plugins que definem os comandos
import AnalyzePlugin from './plugins/analyze';
import GeneratePlugin from './plugins/generate';
import ModifyPlugin from './plugins/modify';
import ExplainPlugin from './plugins/explain';

// Mapeia os nomes dos comandos às suas implementações de plugin
const commands = {
    analyze: AnalyzePlugin,
    generate: GeneratePlugin,
    modify: ModifyPlugin,
    explain: ExplainPlugin,
};

// Função auxiliar para listar arquivos no diretório atual
async function listFiles(directory: string = '.'): Promise<string[]> {
    try {
        const items = await readdir(directory, { withFileTypes: true });
        return items
            .filter(item => !item.name.startsWith('.'))
            .map(item => item.name)
            .sort();
    } catch (error) {
        console.error('\n❌ Erro ao listar arquivos:', error);
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
        console.log(`        Para configurar:
        1. Abra o LM Studio
        2. Carregue um modelo
        3. Ative o 'Local Server' (porta 1234)
        `);
        rl.close();
        return;
    }

    showHelp();
    rl.prompt();

    rl.on('line', async (input) => {
        try {
            const trimmedInput = input.trim();

            // Se a entrada estiver vazia, apenas mostre o prompt novamente.
            if (!trimmedInput) {
                rl.prompt();
                return;
            }

            const [commandName, ...args] = trimmedInput.split(/\s+/);

            switch (commandName.toLowerCase()) {
                case 'quit':
                case 'exit':
                case 'q':
                    console.log('Até logo! 👋');
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
                    console.log('\n📂 Arquivos disponíveis:\n');
                    console.log(files.length ? files.join('\n') : 'Nenhum arquivo encontrado');
                    break;

                default:
                    const command = commands[commandName as keyof typeof commands];
                    if (command) {
                        // Extrai argumentos e "falsas" opções para compatibilidade
                        // O modo interativo não lida com opções como -l ou -o por enquanto
                        const commandArgs = trimmedInput.substring(commandName.length).trim().split(/\s+/);
                        await command.action(client, commandArgs, {});
                    } else if (trimmedInput) {
                        console.log('\n💭 Processando como chat...');
                        const response = await client.sendMessage(trimmedInput);
                        console.log('\n🤖 Resposta:\n');
                        console.log(response);
                    } else {
                        // Apenas pressionou Enter
                    }
                    break;
            }
        } catch (error) {
            console.error('\n❌ Erro inesperado no modo interativo:', error);
        }
        rl.prompt();
    });

    rl.on('close', () => {
        process.exit(0);
    });
}

function showHelp() {
    console.log(`
    Comandos disponíveis:
    
    📁 Arquivos:
    - analyze <arquivo>       Analisa um arquivo de código
    - generate <descrição>    Gera código baseado na descrição
    - modify <arquivo> <instrução>  Modifica um arquivo existente
    - explain [diretório]     Analisa a estrutura do diretório
    - list/ls                 Lista arquivos disponíveis
    
    ⚙️  Utilitários:
    - clear/cls               Limpa a tela
    - help/h                  Mostra esta ajuda
    - quit/exit/q             Sai do programa
    
    💬 Chat:
    - <qualquer texto>        Envia mensagem direta ao LM Studio
    `);
}


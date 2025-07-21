

import { CLIPlugin, CommandOption } from './plugin.interface';
import { LMStudioClient } from '../lm-client';
import { join } from 'path';

// Função para limpar a resposta do LLM, removendo ```
function cleanCodeResponse(text: string): string {
    const lines = text.split('\n');
    if (lines.length > 1 && lines[0].trim().startsWith('```')) {
        return lines.slice(1, -1).join('\n');
    }
    return text;
}

// A lógica real do comando
async function generateAction(client: LMStudioClient, args: any[], options: any) {
    const [description] = args;
    if (!description) {
        console.error('\n❌ Erro: A descrição do código é obrigatória.');
        return;
    }

    try {
        const systemPrompt = `Você é um programador expert em ${options.language}. Gere código limpo, funcional e bem documentado.`;

        const message = [
            `Crie um código ${options.language} para: ${description}`,
            'Requisitos:',
            '1. Código funcional e bem estruturado',
            '2. Comentários explicativos',
            '3. Tratamento de erros',
            '4. Boas práticas de programação',
            '5. Imports necessários',
            '',
            'Forneça APENAS o código, sem explicações.'
        ].join('\n');

        console.log('\n✨ Gerando código...');
        let code = await client.sendMessage(message, systemPrompt);
        code = cleanCodeResponse(code);

        if (options.output) {
            const outputPath = join(process.cwd(), options.output);
            await Bun.write(outputPath, code);
            console.log(`\n✅ Código salvo em: ${outputPath}`);
        } else {
            console.log('\n✨ Código gerado:\n');
            console.log(code);
        }

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Erro na geração:`, message);
    }
}

const generateOptions: CommandOption[] = [
    {
        flags: '-l, --language <lang>',
        description: 'Linguagem de programação a ser usada',
        defaultValue: 'typescript'
    },
    {
        flags: '-o, --output <file>',
        description: 'Salvar o código gerado em um arquivo de saída'
    }
];

// O objeto do plugin que exportamos
const GeneratePlugin: CLIPlugin = {
    name: 'generate <description>',
    description: 'Gera código a partir de uma descrição textual.',
    options: generateOptions,
    action: generateAction
};

export default GeneratePlugin;


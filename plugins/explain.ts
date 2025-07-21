import { CLIPlugin } from './plugin.interface';
import { LMStudioClient } from '../lm-client';
import { readdir } from 'fs/promises';
import { join } from 'path';

async function getDirectoryStructure(dirPath: string, indent = ''): Promise<string> {
    let structure = '';
    try {
        const items = await readdir(dirPath, { withFileTypes: true });
        for (const item of items) {
            if (item.name.startsWith('.') || item.name === 'node_modules') continue; // Ignora arquivos/pastas comuns
            
            structure += `${indent}${item.name}${item.isDirectory() ? '/' : ''}\n`;

            if (item.isDirectory()) {
                structure += await getDirectoryStructure(join(dirPath, item.name), `${indent}  `);
            }
        }
    } catch (error) {
        // Ignora erros de permissão, etc., para não parar a análise
    }
    return structure;
}

// A lógica real do comando
async function explainAction(client: LMStudioClient, args: any[]) {
    const [dirPath = '.'] = args;

    try {
        const resolvedPath = join(process.cwd(), dirPath);
        console.log(`\n📁 Analisando a estrutura de: ${resolvedPath}`);
        const structure = await getDirectoryStructure(resolvedPath);

        if (!structure) {
            console.log('\n⚠️ Não foi possível ler a estrutura do diretório ou o diretório está vazio.');
            return;
        }
        
        const systemPrompt = `Você é um especialista em arquitetura de software. 
        Analise a estrutura do projeto fornecida e dê insights valiosos.`
        
        const message = [
            'Analise esta estrutura de projeto:',
            '```',
            structure,
            '```',
            '',
            'Forneça uma análise concisa sobre:',
            '1. O propósito provável do projeto e as tecnologias usadas.',
            '2. A organização dos arquivos e a arquitetura (ex: MVC, modular, etc.).',
            '3. Pontos positivos e possíveis sugestões de melhoria na estrutura.'
        ].join('\n');
        
        const analysis = await client.sendMessage(message, systemPrompt);
        console.log('\n📊 Análise de diretório:\n');
        console.log(analysis);

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Falha na análise do diretório:`, message);
    }
}

// O objeto do plugin que exportamos
const ExplainPlugin: CLIPlugin = {
    name: 'explain [directory]',
    description: 'Analisa a estrutura de um diretório e explica sua arquitetura.',
    action: explainAction
};

export default ExplainPlugin;

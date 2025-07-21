
import { CLIPlugin } from './plugin.interface';
import { LMStudioClient } from '../lm-client';
import { readFile } from 'fs/promises';
import { join } from 'path';

// A lógica real do comando
async function analyzeAction(client: LMStudioClient, args: any[]) {
    const [filePath] = args;
    if (!filePath) {
        console.error('\n❌ Erro: O caminho do arquivo é obrigatório.');
        return;
    }

    try {
        const absolutePath = join(process.cwd(), filePath);
        const code = await readFile(absolutePath, 'utf-8');
        
        const systemPrompt = [
            'Você é um especialista em análise de código.',
            'Analise o código fornecido e dê feedback detalhado e construtivo.'
        ].join(' ');
        
        const message = [
            'Analise o seguinte código:',
            '1. Resumo do que faz',
            '2. Possíveis melhorias',
            '3. Problemas identificados',
            '4. Sugestões de otimização',
            '',
            `Código (${filePath}):`,
            '```',
            code,
            '```'
        ].join('\n');
        
        const analysis = await client.sendMessage(message, systemPrompt);
        console.log('\n🔍 Análise:\n');
        console.log(analysis);

    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            console.error(`\n❌ Erro: Arquivo não encontrado em '${filePath}'.`);
        } else {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`\n❌ Erro ao analisar:`, message);
        }
    }
}

// O objeto do plugin que exportamos
const AnalyzePlugin: CLIPlugin = {
    name: 'analyze <file>',
    description: 'Analisa um arquivo de código e fornece feedback.',
    action: analyzeAction
};

export default AnalyzePlugin;


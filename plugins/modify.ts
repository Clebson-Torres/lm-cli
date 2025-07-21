

import { CLIPlugin } from './plugin.interface';
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
async function modifyAction(client: LMStudioClient, args: any[]) {
    const [filePath, instruction] = args;
    if (!filePath || !instruction) {
        console.error('\n❌ Erro: O caminho do arquivo e a instrução são obrigatórios.');
        return;
    }

    try {
        const resolvedPath = join(process.cwd(), filePath);
        const file = Bun.file(resolvedPath);
        
        if (!await file.exists()) {
            console.error(`\n❌ Erro: Arquivo não encontrado em '${resolvedPath}'.`);
            return;
        }

        const content = await file.text();
        const backupPath = `${resolvedPath}.backup`;

        // Criar backup
        await Bun.write(backupPath, content);
        console.log(`\n💾 Backup do arquivo original criado em: ${backupPath}`);

        const systemPrompt = 'Você é um programador expert. Modifique o código fornecido para atender à instrução, mantendo a funcionalidade e as boas práticas.';

        const message = [
            `Modifique o seguinte código conforme a instrução: "${instruction}"`,
            '',
            `Código atual no arquivo '${filePath}':`,
            '```',
            content,
            '```',
            '',
            'Forneça APENAS o código modificado, sem explicações ou texto adicional.'
        ].join('\n');

        console.log(`\n✏️  Modificando ${filePath}...`);
        let newContent = await client.sendMessage(message, systemPrompt);
        newContent = cleanCodeResponse(newContent);

        await Bun.write(resolvedPath, newContent);
        console.log(`\n✅ Arquivo modificado com sucesso!`);

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Erro na modificação:`, message);
    }
}

// O objeto do plugin que exportamos
const ModifyPlugin: CLIPlugin = {
    name: 'modify <file> <instruction>',
    description: 'Modifica um arquivo existente com base em uma instrução.',
    action: modifyAction
};

export default ModifyPlugin;


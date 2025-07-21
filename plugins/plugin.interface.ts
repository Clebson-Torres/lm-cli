
import { LMStudioClient } from '../lm-client';

// Define a estrutura para uma opção de linha de comando
export interface CommandOption {
    flags: string; // Ex: '-o, --output <file>'
    description: string;
    defaultValue?: any;
}

// O contrato que todo plugin de comando deve seguir
export interface CLIPlugin {
    name: string; // Ex: 'analyze <file>'
    description:string;
    options?: CommandOption[];
    action: (client: LMStudioClient, args: any[], options?: any) => Promise<void>;
}

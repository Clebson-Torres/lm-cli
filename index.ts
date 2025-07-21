#!/usr/bin/env bun

import { Command } from 'commander';
import { LMStudioClient } from './lm-client';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { type CLIPlugin } from './plugins/plugin.interface';
import { interactiveMode } from './interactive';

class CLI {
    private program: Command;
    private client: LMStudioClient;

    constructor() {
        this.program = new Command();
        this.client = new LMStudioClient();
    }

    private async setupCLI() {
        this.program
            .name('lmcli')
            .description('CLI avançado para LM Studio com arquitetura de plugins')
            .version('2.0.0')
            .action(async () => {
                
                await interactiveMode(this.client);
            });
        
        await this.loadPlugins();
    }

    private async loadPlugins() {
        const pluginsDir = join(__dirname, 'plugins');
        try {
            const pluginFiles = await readdir(pluginsDir);

            for (const file of pluginFiles) {
                if (file.endsWith('.ts') && !file.endsWith('.interface.ts')) {
                    try {
                        const { default: plugin } = await import(join(pluginsDir, file));
                        
                        if (plugin && typeof plugin.name === 'string' && typeof plugin.action === 'function') {
                            this.registerPlugin(plugin as CLIPlugin);
                        }
                    } catch (error) {
                        console.error(`Falha ao carregar o plugin ${file}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao ler o diretório de plugins:', error);
        }
    }

    private registerPlugin(plugin: CLIPlugin) {
        const cmd = this.program
            .command(plugin.name)
            .description(plugin.description);

        if (plugin.options) {
            for (const opt of plugin.options) {
                cmd.option(opt.flags, opt.description, opt.defaultValue);
            }
        }

        cmd.action(async (...args: any[]) => {
            const options = args.pop();
            const commandArgs = args;
            await plugin.action(this.client, commandArgs, options);
        });
    }

    public async run() {
        await this.setupCLI();
        this.program.parse(process.argv);
    }
}

// Inicialização do CLI
new CLI().run();

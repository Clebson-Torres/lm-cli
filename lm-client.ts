

// Estrutura de uma mensagem na conversa
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Opções para configurar o cliente na inicialização
export interface LMStudioClientOptions {
    baseUrl?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
}

// Opções para uma chamada específica de chat
export interface ChatCompletionOptions {
    systemPrompt?: string;
    newConversation?: boolean;
    stream?: boolean;
    onToken?: (token: string) => void;
    temperature?: number;
    max_tokens?: number;
    model?: string;
}

// Erro personalizado para falhas da API
export class LMStudioAPIError extends Error {
    constructor(message: string, public status?: number, public details?: any) {
        super(message);
        this.name = 'LMStudioAPIError';
    }
}

export class LMStudioClient {
  private options: Required<LMStudioClientOptions>;
  private conversationHistory: Message[] = [];

  constructor(options: LMStudioClientOptions = {}) {
    // Mescla as opções do usuário com os padrões para criar uma configuração completa
    this.options = {
        baseUrl: options.baseUrl || 'http://localhost:1234/v1',
        model: options.model || 'local-model',
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 4096,
    };
  }

  /**
   * Envia uma mensagem para o LLM, gerenciando o histórico da conversa.
   * @param content O conteúdo da mensagem do usuário.
   * @param options Opções para esta chamada específica (pode sobrescrever os padrões do cliente).
   * @returns A resposta completa do assistente.
   */
  async sendMessage(content: string, options: ChatCompletionOptions = {}): Promise<string> {
    // 1. Gerenciar o histórico da conversa
    if (options.newConversation || this.conversationHistory.length === 0) {
        this.conversationHistory = [];
        // Adiciona o prompt do sistema se for uma nova conversa e ele for fornecido
        if (options.systemPrompt) {
            this.conversationHistory.push({ role: 'system', content: options.systemPrompt });
        }
    }
    this.conversationHistory.push({ role: 'user', content });

    // 2. Montar o corpo da requisição, mesclando opções
    const body = {
        model: options.model || this.options.model,
        temperature: options.temperature || this.options.temperature,
        max_tokens: options.max_tokens || this.options.max_tokens,
        stream: !!options.stream, // Garante que seja um booleano
        messages: this.conversationHistory,
    };

    try {
      const response = await fetch(`${this.options.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000) // Timeout de 2 minutos
      });

      // 3. Tratamento de erro aprimorado
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new LMStudioAPIError(
            `Erro na API do LM Studio: ${response.statusText}`,
            response.status,
            errorBody?.error
        );
      }

      // 4. Lidar com streaming vs. resposta completa
      if (body.stream) {
        return this.handleStreamResponse(response, options.onToken);
      } else {
        const data = await response.json();
        // Validação da resposta
        const assistantResponse = data.choices?.[0]?.message?.content;
        if (typeof assistantResponse !== 'string') {
            throw new LMStudioAPIError('Formato de resposta da API inválido.');
        }
        this.conversationHistory.push({ role: 'assistant', content: assistantResponse });
        return assistantResponse;
      }

    } catch (error) {
        if (error instanceof LMStudioAPIError) throw error;
        throw new Error(`Falha ao enviar mensagem: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Processa uma resposta de streaming da API.
   */
  private async handleStreamResponse(response: Response, onToken?: (token: string) => void): Promise<string> {
    if (!response.body) {
        throw new LMStudioAPIError('A resposta de streaming não continha um corpo.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
            const dataContent = line.substring(6);
            if (dataContent.trim() === '[DONE]') break;

            try {
                const json = JSON.parse(dataContent);
                const token = json.choices?.[0]?.delta?.content;
                if (token) {
                    fullResponse += token;
                    onToken?.(token); // Chama o callback para cada token recebido
                }
            } catch {
                // Ignora linhas de dados malformadas que podem ocorrer no stream
            }
        }
    }

    this.conversationHistory.push({ role: 'assistant', content: fullResponse });
    return fullResponse;
  }

  /**
   * Verifica a conexão com o servidor do LM Studio.
   */
  async checkConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const response = await fetch(`${this.options.baseUrl}/models`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      return {
        connected: true,
        message: `Conectado! Modelo ativo: ${data.data?.[0]?.id || 'Nenhum modelo carregado'}`
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'desconhecido';
      return { connected: false, message: `Falha na conexão (${reason}). Verifique se o LM Studio está rodando.` };
    }
  }

  /**
   * Limpa o histórico da conversa atual.
   */
  public clearHistory(): void {
    this.conversationHistory = [];
  }
}
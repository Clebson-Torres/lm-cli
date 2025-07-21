
# LM-CLI: Sua Ferramenta de Linha de Comando para o LM Studio

LM-CLI é uma poderosa ferramenta de linha de comando (CLI) construída com Bun e TypeScript, projetada para interagir diretamente com o seu servidor local do [LM Studio](https://lmstudio.ai/). Analise, gere e modifique código de forma eficiente, tudo a partir do conforto do seu terminal.

## ✨ Recursos Principais

- **Análise de Código:** Peça a um LLM para analisar um arquivo de código e fornecer feedback sobre melhorias, problemas e otimizações.
- **Geração de Código:** Gere trechos de código, funções ou classes a partir de uma simples descrição em linguagem natural.
- **Modificação de Código:** Refatore ou adicione funcionalidades a um arquivo existente com uma instrução direta.
- **Explicação de Arquitetura:** Obtenha uma análise da estrutura de pastas do seu projeto para entender a organização e as tecnologias.
- **Modo Interativo:** Inicie uma sessão de chat contínua para fazer perguntas de acompanhamento sem perder o contexto.
- **Arquitetura de Plugins:** Facilmente extensível. Adicione novos comandos simplesmente criando um novo arquivo na pasta `plugins`.

## ⚙️ Pré-requisitos

1.  **LM Studio Instalado:** Você precisa ter o [LM Studio](https://lmstudio.ai/) instalado e em execução.
2.  **Modelo Carregado:** Carregue um modelo de sua preferência na interface do LM Studio.
3.  **Servidor Local Ativado:** Vá para a aba do Servidor Local (ícone `</>`) e clique em **Start Server**. O CLI se conectará a este servidor.

## 🚀 Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_AQUI>
    cd lm-cli
    ```

2.  **Instale as dependências:**
    ```bash
    bun install
    ```

## 🛠️ Uso

Para usar o `lmcli` como um comando global no seu sistema, crie um link simbólico a partir da pasta do projeto.

```bash
bun link
```

Após executar este comando, você pode chamar `lmcli` de qualquer diretório no seu terminal.

### Comandos Disponíveis

#### `analyze <arquivo>`

Analisa um arquivo de código e fornece um feedback detalhado.

```bash
lmcli analyze src/server.ts
```

#### `generate <descrição>`

Gera código a partir de uma descrição.

**Opções:**
- `-l, --language <lang>`: Define a linguagem de programação (padrão: `typescript`).
- `-o, --output <arquivo>`: Salva o código gerado em um arquivo.

```bash
# Gera uma função e imprime no terminal
lmcli generate "uma função em typescript que calcula o fatorial de um número"

# Gera uma classe em python e salva em um arquivo
lmcli generate "uma classe de API para um blog" -l python -o api/blog_handler.py
```

#### `modify <arquivo> <instrução>`

Modifica um arquivo existente com base em uma instrução. Um backup (`.backup`) do arquivo original é criado automaticamente.

```bash
lmcli modify src/utils.ts "adicione comentários JSDoc para a função calculateFatorial"
```

#### `explain [diretório]`

Analisa a estrutura de um diretório (o atual por padrão) e fornece uma explicação sobre a arquitetura.

```bash
lmcli explain ./src
```

### Modo Interativo

Inicie uma sessão de chat para interações contínuas. Basta executar o comando sem nenhum argumento.

```bash
lmcli
```

Dentro do modo interativo, você pode usar os mesmos comandos (`analyze`, `generate`, etc.) ou simplesmente conversar com o modelo.

---

## Licença

Este projeto está licenciado sob a Licença MIT.

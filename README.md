# LM-CLI: Your Command-Line Interface for LM Studio

LM-CLI is a powerful command-line interface (CLI) tool built with Bun and TypeScript, designed to interact directly with your local [LM Studio](https://lmstudio.ai/) server. Analyze, generate, and modify code efficiently, all from the comfort of your terminal.

## ✨ Key Features

- **Code Analysis:** Ask an LLM to analyze a code file and provide feedback on improvements, issues, and optimizations.
- **Code Generation:** Generate code snippets, functions, or classes from a simple natural language description.
- **Code Modification:** Refactor or add functionality to an existing file with a direct instruction.
- **Architecture Explanation:** Get an analysis of your project's folder structure to understand its organization and technologies.
- **Interactive Mode:** Start a continuous chat session for follow-up questions without losing context.
- **Plugin Architecture:** Easily extensible. Add new commands by simply creating a new file in the `plugins` folder.

## ⚙️ Prerequisites

1.  **LM Studio Installed:** You need to have [LM Studio](https://lmstudio.ai/) installed and running.
2.  **Model Loaded:** Load a model of your choice in the LM Studio interface.
3.  **Local Server Enabled:** Go to the Local Server tab (the `</>` icon) and click **Start Server**. The CLI will connect to this server.

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL_HERE>
    cd lm-cli
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

## 🛠️ Usage

To use `lmcli` as a global command on your system, create a symbolic link from the project folder.

```bash
bun link
```

After running this command, you can call `lmcli` from any directory in your terminal.

### Available Commands

#### `analyze <file>`

Analyzes a code file and provides detailed feedback.

```bash
lmcli analyze src/server.ts
```

#### `generate <description>`

Generates code from a description.

**Options:**
- `-l, --language <lang>`: Sets the programming language (default: `typescript`).
- `-o, --output <file>`: Saves the generated code to a file.

```bash
# Generate a function and print it to the terminal
lmcli generate "a typescript function that calculates the factorial of a number"

# Generate a python class and save it to a file
lmcli generate "an API handler class for a blog" -l python -o api/blog_handler.py
```

#### `modify <file> <instruction>`

Modifies an existing file based on an instruction. A backup (`.backup`) of the original file is created automatically.

```bash
lmcli modify src/utils.ts "add JSDoc comments to the calculateFatorial function"
```

#### `explain [directory]`

Analyzes the structure of a directory (defaults to the current one) and provides an explanation of its architecture.

```bash
lmcli explain ./src
```

### Interactive Mode

Start a chat session for continuous interactions. Simply run the command without any arguments.

```bash
lmcli
```

Inside the interactive mode, you can use the same commands (`analyze`, `generate`, etc.) or just chat with the model.

---

## License

This project is licensed under the MIT License.
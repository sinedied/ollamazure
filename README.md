# ollamazure

[![NPM version](https://img.shields.io/npm/v/ollamazure.svg?style=flat-square)](https://www.npmjs.com/package/ollamazure)
[![Build Status](https://img.shields.io/github/actions/workflow/status/sinedied/ollamazure/ci.yml?style=flat-square&label=Build)](https://github.com/sinedied/ollamazure/actions)
![Node version](https://img.shields.io/node/v/ollamazure?style=flat-square)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7?style=flat-square)](https://github.com/sindresorhus/xo)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

Emulates [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/overview) API on your local machine using [Ollama](https://ollama.com) and open-source models.

## Usage

You need [Node.js v20+](https://nodejs.org) and [Ollama](https://ollama.com) installed on your machine to use this tool.
You can either install the CLI globally:

```bash
npm install -g ollamazure
```

Or use it directly with `npx` without installing it:

```bash
npx ollamazure
```

## Azure OpenAI compatibility

| Feature | Supported / with streaming |
| ------- | -------------------------- |
| [Completions](https://learn.microsoft.com/azure/ai-services/openai/reference#completions) | ✅ / ✅ |
| [Chat completions](https://learn.microsoft.com/azure/ai-services/openai/reference#chat-completions) | ✅ / ✅ |
| [Embeddings](https://learn.microsoft.com/azure/ai-services/openai/reference#embeddings) | ✅ / - |
| [JSON mode](https://learn.microsoft.com/azure/ai-services/openai/how-to/json-mode?tabs=python) | ✅ / ✅ |
| [Function calling](https://learn.microsoft.com/azure/ai-services/openai/how-to/function-calling) | ⛔ / ⛔ |
| [Reproducible outputs](https://learn.microsoft.com/azure/ai-services/openai/how-to/reproducible-output?tabs=pyton) | ✅ / ✅ |
| [Vision](https://learn.microsoft.com/azure/ai-services/openai/how-to/gpt-with-vision?tabs=rest%2Csystem-assigned%2Cresource) | ⛔ / ⛔ |
| [Assistants](https://learn.microsoft.com/azure/ai-services/openai/how-to/assistant) | ⛔ / ⛔ |

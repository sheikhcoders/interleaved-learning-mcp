# Interleaved Learning MCP Server

A Model Context Protocol (MCP) server for interleaved learning, deployed on Vercel.

## 🚀 Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sheikhcoders/interleaved-learning-mcp)

## 📚 What is Interleaved Learning?

Interleaved learning is a cognitive strategy that involves mixing different topics during study sessions instead of focusing on one topic at a time (blocked practice). Research shows this approach improves:

- Long-term retention (up to 43% improvement)
- Ability to distinguish between concepts
- Transfer of knowledge to new situations
- Problem-solving flexibility

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `create_study_plan` | Generate interleaved study schedules with 5 different patterns |
| `generate_interleaved_quiz` | Create mixed-topic quizzes for better practice |
| `create_flashcard_deck` | Create flashcard decks with multiple topics |
| `get_shuffled_flashcards` | Retrieve interleaved flashcards for study |
| `log_study_session` | Track study sessions and quiz scores |
| `get_learning_progress` | View progress with personalized recommendations |
| `get_interleaving_patterns` | Learn about different interleaving strategies |

## 🔌 Connect to Your MCP Client

After deployment, your MCP endpoint will be:
```
https://[your-project].vercel.app/api/mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "interleaved-learning": {
      "transport": {
        "type": "streamable-http",
        "url": "https://[your-project].vercel.app/api/mcp"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "interleaved-learning": {
      "url": "https://[your-project].vercel.app/api/mcp"
    }
  }
}
```

## 🧪 Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test with MCP Inspector
npx @modelcontextprotocol/inspector@latest http://localhost:3000 undefined
```

Then connect to `http://localhost:3000/api/mcp` using Streamable HTTP transport.

## 📦 Tech Stack

- Next.js 15
- mcp-handler (Vercel's MCP adapter)
- @modelcontextprotocol/sdk
- TypeScript
- Zod for validation

## 📄 License

MIT

# 🧠 Interleaved Learning MCP Server

A Model Context Protocol (MCP) server for implementing **interleaved learning** - a research-backed cognitive strategy that improves long-term retention by mixing different topics during study.

## 🚀 Features

### 1. 📅 Study Scheduler (`create_study_plan`)
Generate interleaved study plans with multiple patterns:
- **Random**: Unpredictable order for maximum discrimination
- **Systematic Short**: ABCABC - Quick rotations
- **Systematic Extended**: AABBCC - Longer focus periods
- **Front-Loaded**: Deep study then rapid review
- **Spaced**: Integrated with spaced repetition

### 2. ❓ Quiz Generator (`generate_interleaved_quiz`)
Create mixed-topic quizzes that:
- Shuffle questions across topics
- Support multiple choice and open-ended questions
- Optionally show topic hints
- Include answer keys

### 3. 📇 Flashcard Shuffler
- `create_flashcard_deck`: Create flashcard decks with topic tags
- `get_shuffled_flashcards`: Get interleaved flashcards for study

### 4. 📊 Learning Tracker
- `log_study_session`: Track study sessions and quiz scores
- `get_learning_progress`: View progress and get recommendations
- `get_interleaving_patterns`: Learn about different interleaving strategies

## 📦 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sheikhcoders/interleaved-learning-mcp)

### Manual Deploy

1. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Deploy!

2. **Your MCP endpoint will be:**
   ```
   https://your-project.vercel.app/mcp
   ```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build
npm run build
```

## 🔌 Connect to AI Clients

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "interleaved-learning": {
      "transport": {
        "type": "streamable-http",
        "url": "https://your-project.vercel.app/mcp"
      }
    }
  }
}
```

### Cursor / VS Code

Add to your MCP settings:

```json
{
  "mcp": {
    "servers": {
      "interleaved-learning": {
        "url": "https://your-project.vercel.app/mcp"
      }
    }
  }
}
```

## 💡 Example Usage

### Create a Study Plan
```
Create an interleaved study plan for:
- Mathematics: Algebra, Geometry, Calculus
- Physics: Mechanics, Thermodynamics

Duration: 90 minutes
Pattern: systematic_short
```

### Generate a Quiz
```
Generate an interleaved quiz with these topics:
- JavaScript: closures, promises, async/await
- Python: decorators, generators, context managers

10 questions, shuffle options
```

### Track Progress
```
Log my study session:
- Topics: Algebra, Geometry
- Duration: 45 minutes
- Quiz score: 85%
```

## 🔬 The Science Behind Interleaving

Research shows interleaved learning provides:
- **50-125%** improvement in problem-solving (Physics students)
- Better **long-term retention** vs blocked practice
- Improved **transfer of knowledge** to new situations
- Enhanced ability to **discriminate** between concepts

The key insight: Interleaving teaches you **WHICH** strategy to use, not just **HOW** to use it.

## 📚 Interleaving Patterns Explained

| Pattern | Example | Best For |
|---------|---------|----------|
| Random | A-C-B-A-B-C | Advanced learners, exam prep |
| Systematic Short | A-B-C-A-B-C | Beginners, maintaining engagement |
| Systematic Extended | A-A-B-B-C-C | Complex topics, deeper focus |
| Front-Loaded | A-A-A-B-B-B then ABC | New material introduction |
| Spaced | Personalized | Long-term retention |

## 📄 License

MIT

---

Built with ❤️ for better learning | Powered by [Vercel MCP Adapter](https://vercel.com/docs/mcp)

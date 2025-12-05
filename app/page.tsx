export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Interleaved Learning MCP
          </h1>
          <p className="text-xl text-gray-300">
            A Model Context Protocol server for cognitive-optimized learning
          </p>
        </div>

        {/* MCP Endpoint */}
        <div className="bg-gray-800 rounded-xl p-6 mb-12 border border-gray-700">
          <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">MCP Endpoint</h2>
          <code className="text-lg text-green-400 break-all">
            https://interleaved-learning-mcp.vercel.app/api/mcp
          </code>
        </div>

        {/* Tools Grid */}
        <h2 className="text-2xl font-semibold mb-6">Available Tools</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {[
            { name: 'create_study_plan', desc: 'Generate interleaved study schedules', icon: '📅' },
            { name: 'generate_interleaved_quiz', desc: 'Create mixed-topic quizzes', icon: '❓' },
            { name: 'create_flashcard_deck', desc: 'Build multi-topic flashcard decks', icon: '🃏' },
            { name: 'get_shuffled_flashcards', desc: 'Get cards in shuffled order', icon: '🔀' },
            { name: 'log_study_session', desc: 'Track your study sessions', icon: '📝' },
            { name: 'get_learning_progress', desc: 'View stats & recommendations', icon: '📊' },
            { name: 'get_interleaving_patterns', desc: 'Learn interleaving strategies', icon: '🧠' },
          ].map((tool) => (
            <div key={tool.name} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className="font-mono text-blue-400">{tool.name}</h3>
                  <p className="text-sm text-gray-400">{tool.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connect Section */}
        <h2 className="text-2xl font-semibold mb-6">Connect</h2>
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Cursor</span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Recommended</span>
            </h3>
            <p className="text-sm text-gray-400 mb-3">Add to .cursor/mcp.json:</p>
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "mcpServers": {
    "interleaved-learning": {
      "url": "https://interleaved-learning-mcp.vercel.app/api/mcp"
    }
  }
}`}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="font-semibold mb-3">Claude Desktop</h3>
            <p className="text-sm text-gray-400 mb-3">Add to claude_desktop_config.json:</p>
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "mcpServers": {
    "interleaved-learning": {
      "transport": {
        "type": "streamable-http",
        "url": "https://interleaved-learning-mcp.vercel.app/api/mcp"
      }
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Built with Next.js + mcp-handler • Deployed on Vercel</p>
          <a 
            href="https://github.com/sheikhcoders/interleaved-learning-mcp" 
            className="text-blue-400 hover:underline"
          >
            View on GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}

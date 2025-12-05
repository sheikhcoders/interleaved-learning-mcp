export default function Home() {
  const endpoint = "https://interleaved-learning-mcp.vercel.app/api/mcp";
  
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
            {endpoint}
          </code>
        </div>

        {/* Documentation Section */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 mb-12 border border-blue-700/50">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Documentation
          </h2>
          <p className="text-gray-300 mb-4">
            Documentation that simply works. Write in Markdown, create professional docs in minutes — searchable, customizable, in 60+ languages.
          </p>
          <a 
            href="https://github.com/sheikhcoders/interleaved-learning-mcp#readme" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Read Documentation
          </a>
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
      "url": "${endpoint}"
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
        "url": "${endpoint}"
      }
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* Author Section */}
        <div className="mt-16 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Developer</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
              LS
            </div>
            <div>
              <h3 className="text-lg font-semibold">Likhon Sheikh</h3>
              <a 
                href="https://github.com/sheikhcoders" 
                className="text-blue-400 hover:underline text-sm"
              >
                @sheikhcoders
              </a>
              <p className="text-gray-400 text-sm mt-1">Building tools for better learning outcomes</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with Next.js + mcp-handler • Deployed on Vercel</p>
          <p className="mt-2">© 2024 Likhon Sheikh. MIT License.</p>
          <a 
            href="https://github.com/sheikhcoders/interleaved-learning-mcp" 
            className="text-blue-400 hover:underline inline-flex items-center gap-1 mt-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
            </svg>
            View on GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}

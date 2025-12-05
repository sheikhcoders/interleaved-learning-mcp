export default function Home() {
  return (
    <main style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <h1 style={{ color: '#1a1a2e' }}>Interleaved Learning MCP Server</h1>

      <p style={{ fontSize: '18px', color: '#4a4a6a', lineHeight: 1.6 }}>
        This is a Model Context Protocol (MCP) server that helps you implement
        <strong> interleaved learning</strong> - a powerful cognitive strategy that improves
        long-term retention by mixing different topics during study.
      </p>

      <h2 style={{ marginTop: '40px' }}>Available Tools</h2>

      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2d3436' }}>Study Scheduler</h3>
          <p style={{ margin: 0, color: '#636e72' }}>
            Generate interleaved study plans with multiple patterns (random, systematic, front-loaded, spaced)
          </p>
        </div>

        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2d3436' }}>Quiz Generator</h3>
          <p style={{ margin: 0, color: '#636e72' }}>
            Create mixed-topic quizzes that help you practice discrimination learning
          </p>
        </div>

        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2d3436' }}>Flashcard Shuffler</h3>
          <p style={{ margin: 0, color: '#636e72' }}>
            Create and shuffle flashcard decks across topics for interleaved practice
          </p>
        </div>

        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2d3436' }}>Learning Tracker</h3>
          <p style={{ margin: 0, color: '#636e72' }}>
            Track your progress and get personalized recommendations
          </p>
        </div>
      </div>

      <h2 style={{ marginTop: '40px' }}>MCP Endpoint</h2>
      <code style={{
        display: 'block',
        background: '#2d3436',
        color: '#00ff88',
        padding: '15px 20px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        https://your-deployment.vercel.app/mcp
      </code>

      <h2 style={{ marginTop: '40px' }}>Why Interleaved Learning?</h2>
      <ul style={{ lineHeight: 2, color: '#4a4a6a' }}>
        <li>50-125% improvement in problem-solving for physics students</li>
        <li>Forces the brain to discriminate between concepts</li>
        <li>Strengthens long-term memory through desirable difficulty</li>
        <li>Teaches you WHICH strategy to use, not just HOW to use it</li>
      </ul>
    </main>
  );
}

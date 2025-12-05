export const metadata = {
  title: 'Interleaved Learning MCP Server',
  description: 'MCP Server for interleaved learning - Study Scheduler, Quiz Generator, Flashcard Shuffler, and Learning Tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

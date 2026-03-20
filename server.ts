import express from 'express';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/chat/groq', async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: 'GROQ_API_KEY is not set in environment variables. Please add it in the AI Studio secrets.' });
      }

      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const stream = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are Sansnsi, a highly capable, 24/7 AI assistant. You are concise, professional, and helpful. You communicate clearly and effectively.' },
          ...messages
        ],
        model: 'llama3-8b-8192',
        stream: true,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Groq API Error:', error);
      res.status(500).json({ error: error.message || 'Failed to communicate with Groq API' });
    }
  });

  // Handle OAuth callback to close the popup if the provider redirects here
  app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              // The Sanscounts provider might send the message directly, 
              // but if it redirects here, we just close the window.
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication complete. You can close this window.</p>
        </body>
      </html>
    `);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

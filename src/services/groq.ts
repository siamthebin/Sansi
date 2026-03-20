export async function* streamGroqChat(
  history: { role: 'user' | 'assistant'; content: string }[],
  message: string
) {
  const messages = [...history, { role: 'user', content: message }];
  
  const response = await fetch('/api/chat/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch from Groq');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No reader available');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            yield data.content;
          }
        } catch (e) {
          console.error('Error parsing stream chunk', e);
        }
      }
    }
  }
}

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'model';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'group relative flex w-full items-start gap-4 px-4 py-6 md:px-6 md:py-8',
        isUser ? 'bg-transparent' : 'bg-[#111111]'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm',
          isUser
            ? 'border-[#27272a] bg-[#18181b] text-white'
            : 'border-[#333333] bg-black text-white'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden px-1">
        <div className="max-w-none break-words text-[#ededed] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0 text-[#ededed]">{children}</p>;
              },
              pre({ children }) {
                return (
                  <pre className="my-4 overflow-x-auto rounded-lg border border-[#27272a] bg-[#0a0a0a] p-4 text-sm">
                    {children}
                  </pre>
                );
              },
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <code
                    className={cn(
                      'block text-[#ededed] font-mono text-sm',
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    className="rounded-md bg-[#27272a] px-1.5 py-0.5 font-mono text-sm text-[#ededed]"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#ededed] underline underline-offset-4 hover:text-white"
                  >
                    {children}
                  </a>
                );
              },
              ul({ children }) {
                return <ul className="my-4 list-disc pl-6 text-[#ededed]">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="my-4 list-decimal pl-6 text-[#ededed]">{children}</ol>;
              },
              li({ children }) {
                return <li className="mb-1 text-[#ededed]">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="mb-4 mt-6 text-2xl font-semibold text-white">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="mb-4 mt-6 text-xl font-semibold text-white">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="mb-4 mt-6 text-lg font-semibold text-white">{children}</h3>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

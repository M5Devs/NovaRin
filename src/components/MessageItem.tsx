import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Bot, User } from 'lucide-react';
import type { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`py-4 px-4 md:px-6 transition ${isUser ? 'bg-transparent' : 'bg-slate-900/40 border-y border-slate-800/40'}`}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Bot className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {isUser ? 'You' : 'Assistant'}
            </span>
            <span className="text-[10px] text-slate-600">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="text-slate-100 text-sm leading-relaxed overflow-hidden">
            {isUser ? (
              <div className="whitespace-pre-wrap font-sans text-slate-200">{message.content}</div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (!inline && match) {
                      return (
                        <CodeBlock language={match[1]} value={codeString} />
                      );
                    } else if (!inline) {
                      return (
                        <CodeBlock language="text" value={codeString} />
                      );
                    }

                    return (
                      <code
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700/60"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>;
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                      >
                        {children}
                      </a>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3 border border-slate-800 rounded-lg">
                        <table className="w-full text-left text-xs divide-y divide-slate-800">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead className="bg-slate-950 text-slate-300">{children}</thead>;
                  },
                  th({ children }) {
                    return <th className="px-3 py-2 font-semibold">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-3 py-2 border-t border-slate-800/60 text-slate-300">{children}</td>;
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <span className="text-[11px] font-medium uppercase tracking-wider text-cyan-400">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 transition text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-1 overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '0.75rem 1rem',
            background: 'transparent',
            fontSize: '0.8rem',
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

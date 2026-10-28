import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, RotateCcw, Edit2, Zap, User } from 'lucide-react';
import type { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onEdit?: (messageId: string, newContent: string) => void;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onRegenerate,
  onEdit,
  isStreaming = false,
}) => {
  const isUser = message.role === 'user';
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(message.content);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleSaveEdit = () => {
    if (editInput.trim() && onEdit) {
      onEdit(message.id, editInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className={`group py-4 px-4 md:px-6 transition-all duration-200 ${
      isUser ? 'bg-transparent' : 'bg-zinc-900/40 border-y border-zinc-800/40'
    }`}>
      <div className="max-w-3xl mx-auto flex gap-3 md:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shadow-sm">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-950 to-indigo-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10 ${
              isStreaming ? 'animate-pulse' : ''
            }`}>
              <Zap className="w-4 h-4 text-cyan-400 fill-current" />
            </div>
          )}
        </div>

        {/* Content & Toolbar Area */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">
                {isUser ? 'You' : 'NovaRin Assistant'}
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* User Message Edit Mode */}
          {isUser && isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editInput}
                onChange={e => setEditInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-cyan-500 resize-none"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded-lg text-xs bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold transition"
                >
                  Save & Resend
                </button>
              </div>
            </div>
          ) : (
            /* Standard Message Content */
            <div className="text-zinc-100 text-sm leading-relaxed overflow-hidden">
              {isUser ? (
                /* User Message Bubble */
                <div className="inline-block px-4 py-2.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-100 shadow-sm whitespace-pre-wrap font-sans">
                  {message.content}
                </div>
              ) : (
                /* Assistant Markdown Block */
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ _node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');

                        if (!inline && match) {
                          return <CodeBlock language={match[1]} value={codeString} />;
                        } else if (!inline) {
                          return <CodeBlock language="text" value={codeString} />;
                        }

                        return (
                          <code
                            className="px-1.5 py-0.5 rounded-md bg-zinc-800/80 text-cyan-300 font-mono text-xs border border-zinc-700/60"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return <p className="mb-3 last:mb-0 leading-relaxed text-zinc-200">{children}</p>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-5 mb-3 space-y-1 text-zinc-200">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-5 mb-3 space-y-1 text-zinc-200">{children}</ol>;
                      },
                      a({ href, children }) {
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 font-medium"
                          >
                            {children}
                          </a>
                        );
                      },
                      table({ children }) {
                        return (
                          <div className="overflow-x-auto my-3 border border-zinc-800 rounded-xl">
                            <table className="w-full text-left text-xs divide-y divide-zinc-800">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children }) {
                        return <thead className="bg-zinc-900 text-zinc-300">{children}</thead>;
                      },
                      th({ children }) {
                        return <th className="px-3 py-2 font-semibold">{children}</th>;
                      },
                      td({ children }) {
                        return <td className="px-3 py-2 border-t border-zinc-800/60 text-zinc-300">{children}</td>;
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Action Toolbar on Hover */}
          {!isEditing && (
            <div className="pt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
                title="Copy Markdown"
              >
                {copiedMarkdown ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-sans">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {isUser && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
                  title="Edit prompt"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}

              {!isUser && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800/80 transition"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
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
    <div className="relative my-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs shadow-xl">
      {/* Code Block Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800/80 text-zinc-400">
        <div className="flex items-center gap-2">
          {/* Mac / Terminal dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-[11px] font-mono font-medium text-cyan-400 uppercase tracking-wider">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 transition text-[11px]"
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
            padding: '0.85rem 1rem',
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

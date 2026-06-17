import { Bot, Send, Sparkles, X } from 'lucide-react';

function ChatPanel({ messages, chatInput, setChatInput, isTyping, onSubmit, onClose }) {
  const hasEmptyBotMessage = messages.some((message) => message.from === 'bot' && !message.text);

  function updateInput(event) {
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 140)}px`;
    setChatInput(event.target.value);
  }

  function submitWithEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form.requestSubmit();
    }
  }

  return (
    <aside className="flex h-full max-h-[calc(100vh-24px)] min-h-[520px] flex-col rounded-lg border border-slate-200 bg-white shadow-2xl sm:h-[620px] dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">ReleaseBOT Chat</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assistente AI</p>
            </div>
          </div>

          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={onClose}
            aria-label="Fechar chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => message.text && (
          <div
            key={`${message.from}-${index}`}
            className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                message.from === 'user'
                  ? 'rounded-br-sm bg-blue-600 text-white'
                  : 'rounded-bl-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {isTyping && !hasEmptyBotMessage && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <Sparkles size={16} />
              <span className="text-sm">a escrever...</span>
            </div>
          </div>
        )}
      </div>

      <form className="border-t border-slate-200 p-4 dark:border-slate-800" onSubmit={onSubmit}>
        <div className="flex gap-2">
          <textarea
            rows={1}
            className="max-h-[140px] min-h-[40px] flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Ex: faz um plano de promoção"
            value={chatInput}
            onChange={updateInput}
            onKeyDown={submitWithEnter}
          />
          <button className="rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-700">
            <Send size={18} />
          </button>
        </div>
      </form>
    </aside>
  );
}

export default ChatPanel;

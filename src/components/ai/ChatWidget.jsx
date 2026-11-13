import { useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sendingRef = useRef(false);
  const messagesRef = useRef([]);

  async function handleSend() {
    const text = message.trim();

    if (!text || sendingRef.current) return;

    sendingRef.current = true;
    setIsLoading(true);
    setMessage("");

    // Display the customer's message immediately.
    
const previousMessages = messagesRef.current;

const updatedMessages = [
  ...previousMessages,
  { role: "user", text },
];

messagesRef.current = updatedMessages;
setMessages(updatedMessages);


    try {
      const response = await fetch(
        "http://localhost:3001/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          message: text,
          history: previousMessages,
         }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

     
const assistantMessages = [
  ...messagesRef.current,
  {
    role: "assistant",
    text: data.reply || "Sorry, I couldn't respond.",
  },
];

messagesRef.current = assistantMessages;
setMessages(assistantMessages);
} catch (error) {
  console.error("Chat error:", error);

  const errorMessages = [
    ...messagesRef.current,
    {
      role: "assistant",
      text: "Sorry, I'm having trouble connecting right now. Please try again.",
    },
  ];

  messagesRef.current = errorMessages;
  setMessages(errorMessages);
}
 finally {
      sendingRef.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 flex h-[480px] w-[350px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-amber-700 px-4 py-3 text-white">
            <div>
              <h3 className="font-semibold">Ask Pegasus</h3>
              <p className="text-xs text-amber-100">
                Your shopping assistant
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Welcome message appears only once */}
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-gray-700">
              Kia ora! Welcome to Pegasus General Store.
              How can I help you today?
            </div>

            {/* Conversation messages */}
            <div
              className="mt-3 space-y-3"
              aria-live="polite"
            >
              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${
                    item.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                      item.role === "user"
                        ? "bg-amber-700 text-white"
                        : "bg-amber-50 text-gray-700"
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="text-sm text-gray-500">
                  Ask Pegasus is typing...
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 border-t p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSend();
                }
              }}
              placeholder="Ask me something..."
              aria-label="Chat message"
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              aria-label="Send message"
              className="rounded-lg bg-amber-700 p-2 text-white disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close chat" : "Open Ask Pegasus"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-700 text-white shadow-lg hover:bg-amber-800"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}

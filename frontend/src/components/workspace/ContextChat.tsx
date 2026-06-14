"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useSevenStore } from "@/store/useSevenStore";
import { Send, Terminal } from "lucide-react";

export default function ContextChat({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const { activityLogs, userProfile, connectWebSocket } = useSevenStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectWebSocket();
    fetchMessages();
  }, [channelId, connectWebSocket]);

  // Listen for new_message events from WS
  useEffect(() => {
    if (activityLogs.length > 0) {
      const latest = activityLogs[0];
      if (latest.type === "new_message" && latest.message.channel_id === channelId) {
        // Prevent duplicates if we just sent it
        if (!messages.find(m => m.message_id === latest.message.message_id)) {
          setMessages(prev => [...prev, latest.message]);
        }
      }
    }
  }, [activityLogs, channelId, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch(`/api/channels/${channelId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userProfile) return;

    const token = localStorage.getItem("seven_token");
    const isCode = input.includes("```");
    const content = input;
    setInput("");
    
    // Optimistic UI
    const tempMsg = {
      message_id: "temp-" + Date.now(),
      channel_id: channelId,
      sender_id: userProfile.user_id,
      content: content,
      is_code_snippet: isCode,
      created_at: new Date().toISOString(),
      sender: userProfile
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch(`/api/messages?sender_id=${userProfile.user_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          channel_id: channelId,
          content: content,
          is_code_snippet: isCode
        })
      });
      // The actual message will come back via WS, we can handle dedup or just let it replace.
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col bg-[#050505] border border-zinc-800 rounded-lg h-[500px] font-mono mt-6">
      <div className="bg-[#111111] px-4 py-3 border-b border-zinc-800 flex items-center text-sm font-bold text-zinc-300">
        <Terminal className="w-4 h-4 mr-2 text-[#00E5FF]" />
        CONTEXT CHANNEL
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === userProfile?.user_id;
          return (
            <div key={msg.message_id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-zinc-500 mb-1">
                {msg.sender?.full_name || 'Unknown'} // {new Date(msg.created_at).toLocaleTimeString()}
              </span>
              <div className={`max-w-[80%] rounded p-3 text-sm prose prose-invert prose-sm max-w-none prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800 ${isMe ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-zinc-200' : 'bg-[#111111] border border-zinc-800 text-zinc-300'}`}>
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-[#0a0a0a] border-t border-zinc-800 flex items-end space-x-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter markdown... (use ``` for code)"
          className="flex-1 bg-black border border-zinc-800 rounded p-2 text-sm text-zinc-200 font-mono resize-none h-16 focus:outline-none focus:border-[#00E5FF] placeholder:text-zinc-600"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <button type="submit" className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded hover:bg-[#00E5FF] hover:text-black transition-colors border border-[#00E5FF]/30 h-16 w-16 flex items-center justify-center shrink-0">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

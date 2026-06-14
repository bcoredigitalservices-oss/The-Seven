"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { 
  MessageSquare, 
  Send, 
  Lock, 
  Shield, 
  User, 
  Search, 
  RefreshCw, 
  Clock,
  AlertCircle,
  Code,
  Smile,
  ShieldCheck,
  Globe,
  Users,
  Copy,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { encryptMessage, decryptMessage } from "@/utils/crypto";

interface ChatMessage {
  dm_id?: string;
  gm_id?: string;
  sender_id: string;
  sender_name: string;
  receiver_id?: string;
  receiver_name?: string;
  group_id?: string;
  content: string;
  is_code_snippet?: boolean;
  created_at: string;
}

export default function CommunicationPage() {
  const { userProfile, simulatedUser, allUsers, fetchAllUsers } = useSevenStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dm" | "group">("dm");
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Show raw database hex cipher toggle
  const [showRawPayloads, setShowRawPayloads] = useState<Record<string, boolean>>({});
  
  // Emoji panel control
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const quickEmojis = ["👍", "🔥", "🚀", "💻", "🎉", "❤️", "😂", "✅", "⚠️", "🤔", "👀", "🙌"];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeUser = simulatedUser || userProfile;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch users & groups on mount
  useEffect(() => {
    fetchAllUsers();
    fetchGroups();
  }, [simulatedUser]);

  const fetchGroups = async () => {
    const token = localStorage.getItem("seven_token");
    try {
      const res = await fetch("/api/groups", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  // Filter users based on Search and CEO role restrictions
  const isCEO = activeUser?.role_tier === 1;
  const ceos = allUsers.filter(u => u.role_tier === 1 && u.user_id !== activeUser?.user_id);
  const nonCeos = allUsers.filter(u => u.role_tier !== 1 && u.user_id !== activeUser?.user_id);

  // If CEO, show all users. If non-CEO, show ONLY CEOs.
  const targetUsers = isCEO ? [...ceos, ...nonCeos] : ceos;

  const filteredUsers = targetUsers.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Set default selection once lists load
  useEffect(() => {
    if (activeTab === "dm" && filteredUsers.length > 0 && !selectedUser) {
      setSelectedUser(filteredUsers[0]);
    } else if (activeTab === "group" && filteredGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(filteredGroups[0]);
    }
  }, [filteredUsers, filteredGroups, activeTab]);

  // Keys for E2E Encryption
  const getDmSecretKey = (otherId: string) => {
    if (!activeUser) return "seven_fallback_key";
    return [activeUser.user_id, otherId].sort().join("-");
  };

  const getGroupSecretKey = (groupId: string) => {
    return `group-secret-${groupId}`;
  };

  const getActiveSecretKey = () => {
    if (activeTab === "dm" && selectedUser) {
      return getDmSecretKey(selectedUser.user_id);
    }
    if (activeTab === "group" && selectedGroup) {
      return getGroupSecretKey(selectedGroup.group_id);
    }
    return "default_secret";
  };

  // Fetch messages
  const fetchMessages = async () => {
    const token = localStorage.getItem("seven_token");
    const simulatedUser = useSevenStore.getState().simulatedUser;
    
    if (activeTab === "dm") {
      if (!selectedUser) return;
      try {
        const url = simulatedUser
          ? `/api/v1/communication/dms?other_user_id=${selectedUser.user_id}&simulate_user_id=${simulatedUser.user_id}`
          : `/api/v1/communication/dms?other_user_id=${selectedUser.user_id}`;
        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load DMs", err);
      }
    } else {
      if (!selectedGroup) return;
      try {
        const url = simulatedUser
          ? `/api/v1/communication/groups/${selectedGroup.group_id}/messages?simulate_user_id=${simulatedUser.user_id}`
          : `/api/v1/communication/groups/${selectedGroup.group_id}/messages`;
        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load group messages", err);
      }
    }
  };

  useEffect(() => {
    setMessages([]);
    setIsLoadingMessages(true);
    fetchMessages().finally(() => setIsLoadingMessages(false));
  }, [selectedUser, selectedGroup, activeTab]);

  // Polling for live chat updates
  useEffect(() => {
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedUser, selectedGroup, activeTab]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    setIsSending(true);
    const token = localStorage.getItem("seven_token");
    const secretKey = getActiveSecretKey();
    const encrypted = encryptMessage(chatInput, secretKey);
    const simulatedUser = useSevenStore.getState().simulatedUser;

    try {
      if (activeTab === "dm") {
        if (!selectedUser) return;
        const url = simulatedUser
          ? `/api/v1/communication/dms?simulate_user_id=${simulatedUser.user_id}`
          : "/api/v1/communication/dms";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            receiver_id: selectedUser.user_id,
            content: encrypted,
            is_code_snippet: isCodeMode
          })
        });

        if (res.ok) {
          const newMsg = await res.json();
          setMessages(prev => [...prev, newMsg]);
          setChatInput("");
          setIsCodeMode(false);
          setShowEmojiPicker(false);
        } else if (res.status === 403) {
          alert("Forbidden: One-to-one direct messages are restricted to CEO accounts.");
        }
      } else {
        if (!selectedGroup) return;
        const url = simulatedUser
          ? `/api/v1/communication/groups/${selectedGroup.group_id}/messages?simulate_user_id=${simulatedUser.user_id}`
          : `/api/v1/communication/groups/${selectedGroup.group_id}/messages`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            group_id: selectedGroup.group_id,
            content: encrypted,
            is_code_snippet: isCodeMode
          })
        });

        if (res.ok) {
          const newMsg = await res.json();
          setMessages(prev => [...prev, newMsg]);
          setChatInput("");
          setIsCodeMode(false);
          setShowEmojiPicker(false);
        } else if (res.status === 403) {
          alert("Forbidden: You are not authorized to post to this squad group.");
        }
      }
    } catch (err) {
      console.error("Message send failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyCode = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle raw payload mode
  const toggleRawPayload = (msgId: string) => {
    setShowRawPayloads(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Dynamic renderer for text (handles links, codes, decrypted strings)
  const renderMessageText = (msg: ChatMessage) => {
    const msgId = msg.dm_id || msg.gm_id || "temp";
    const isRaw = showRawPayloads[msgId];
    
    // If user clicked E2E to view raw database cipher
    if (isRaw) {
      return (
        <div className="font-mono text-[10px] text-zinc-500 break-all bg-zinc-950 p-2 rounded border border-zinc-900 select-all">
          <p className="text-[#00E5FF]/80 font-bold mb-1 uppercase tracking-wider text-[8px]">RAW DB CIPHERTEXT:</p>
          {msg.content}
        </div>
      );
    }

    const secretKey = getActiveSecretKey();
    const decrypted = decryptMessage(msg.content, secretKey);

    if (msg.is_code_snippet) {
      return (
        <div className="relative mt-1 bg-zinc-950 border border-zinc-800/60 rounded-lg p-3 font-mono text-zinc-300 text-xs overflow-x-auto select-text">
          <div className="flex justify-between items-center mb-2 border-b border-zinc-900 pb-1.5 text-[9px] text-zinc-500">
            <span>SECURE CODE BLK</span>
            <button
              onClick={() => handleCopyCode(decrypted, msgId)}
              className="text-[#00E5FF] hover:underline flex items-center space-x-1"
            >
              {copiedId === msgId ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="custom-scrollbar max-h-60 overflow-y-auto"><code>{decrypted}</code></pre>
        </div>
      );
    }

    // Link detector regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = decrypted.split(urlRegex);
    return (
      <p className="select-text whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00E5FF] hover:underline inline-flex items-center space-x-1 break-all"
              >
                <span>{part}</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            );
          }
          return part;
        })}
      </p>
    );
  };

  const handleEmojiSelect = (emoji: string) => {
    setChatInput(prev => prev + emoji);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-[#00E5FF] tracking-[0.2em] uppercase">SECURE CHAT MODULE</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1">COMMUNICATION MATRIX</h1>
        </div>
        <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/80 text-[10px] font-mono">
          <Shield className="w-3.5 h-3.5 text-[#00E5FF] mr-1.5" />
          <span className="text-zinc-400">STATUS:</span>
          <span className="text-emerald-400">E2E ENCRYPTED LINK</span>
        </div>
      </div>

      {/* Main Chat Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0">
        
        {/* Left Side: Users/Groups Roster */}
        <div className="md:col-span-1 bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-4 flex flex-col min-h-0">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-zinc-800/80 mb-4 bg-zinc-950 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("dm")}
              className={`flex-1 py-1.5 text-center text-xs font-mono font-bold rounded-md transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === "dm"
                  ? "bg-[#151515] text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.1)] border border-[#00E5FF]/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>DIRECTS</span>
            </button>
            <button
              onClick={() => setActiveTab("group")}
              className={`flex-1 py-1.5 text-center text-xs font-mono font-bold rounded-md transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === "group"
                  ? "bg-[#151515] text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.1)] border border-[#00E5FF]/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>GROUPS</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === "dm" ? "Search user..." : "Search group..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40"
            />
          </div>

          {/* Peer-to-Peer Lock Notice (Only DM tab if user is not CEO) */}
          {activeTab === "dm" && !isCEO && (
            <div className="mb-4 bg-amber-950/20 border border-amber-900/40 rounded p-2.5 text-[9px] font-mono text-zinc-400 flex items-start space-x-1.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>PEER-TO-PEER LOCK:</strong> Staff accounts can only communicate directly with the CEO. Direct peer chats are disabled.
              </span>
            </div>
          )}

          {/* Roster list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
            {activeTab === "dm" ? (
              filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-zinc-600">
                  No active users.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isUserCEO = user.role_tier === 1;
                  const isSelected = selectedUser?.user_id === user.user_id;
                  return (
                    <button
                      key={user.user_id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full flex items-center space-x-3 p-2.5 rounded-lg border text-left font-mono transition-all ${
                        isSelected 
                          ? "bg-[#151515] border-[#00E5FF]/20 text-[#00E5FF]" 
                          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#111111] hover:text-white"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                        isUserCEO 
                          ? "bg-red-950/20 border-red-800/40 text-red-400" 
                          : "bg-zinc-800 border-zinc-700 text-zinc-300"
                      }`}>
                        {user.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{user.full_name}</p>
                        <p className="text-[9px] text-zinc-500 uppercase truncate">
                          {isUserCEO ? "CEO / Executive" : `${user.department || "General"} // Tier ${user.role_tier}`}
                        </p>
                      </div>
                    </button>
                  );
                })
              )
            ) : (
              filteredGroups.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-zinc-600">
                  No squad groups found.
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = selectedGroup?.group_id === group.group_id;
                  return (
                    <button
                      key={group.group_id}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full flex items-center space-x-3 p-2.5 rounded-lg border text-left font-mono transition-all ${
                        isSelected 
                          ? "bg-[#151515] border-[#00E5FF]/20 text-[#00E5FF]" 
                          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#111111] hover:text-white"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-cyan-950/20 border border-cyan-800/40 text-cyan-400 flex items-center justify-center text-xs font-bold">
                        SG
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{group.name}</p>
                        <p className="text-[9px] text-zinc-500 truncate uppercase">
                          {group.description || "Active Squad Chat"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="md:col-span-3 bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl flex flex-col min-h-0 relative overflow-hidden">
          
          {((activeTab === "dm" && selectedUser) || (activeTab === "group" && selectedGroup)) ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {activeTab === "dm" ? (
                    <>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                        selectedUser.role_tier === 1 
                          ? "bg-red-950/30 border-red-800/50 text-red-400" 
                          : "bg-[#00E5FF]/10 border-[#00E5FF]/20 text-[#00E5FF]"
                      }`}>
                        {selectedUser.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white font-mono">{selectedUser.full_name}</h3>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase">
                          {selectedUser.role_tier === 1 ? "Tier 1 Executive (CEO)" : `Tier ${selectedUser.role_tier} Department Node`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-cyan-950/30 border border-cyan-800/50 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        SG
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white font-mono">{selectedGroup.name}</h3>
                        <p className="text-[9px] font-mono text-[#00E5FF] uppercase">
                          Squad Communication Channel
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-[9px] font-mono text-zinc-400 uppercase">SECURE LINK ONLINE</span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050505]/40 custom-scrollbar">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-650 animate-pulse">
                    Decrypting message stream...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare className="w-8 h-8 text-zinc-800 mb-2" />
                    <p className="text-xs font-mono text-zinc-500">Secure cipher channel established.</p>
                    <p className="text-[10px] font-mono text-zinc-600 max-w-xs mt-1">
                      Messages are encrypted locally before transmission.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isSelf = msg.sender_id === activeUser?.user_id;
                    const msgId = msg.dm_id || msg.gm_id || `temp-${i}`;
                    const isShowingRaw = showRawPayloads[msgId];
                    return (
                      <div 
                        key={msgId} 
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                      >
                        {/* Sender name badge (Group tab only) */}
                        {!isSelf && activeTab === "group" && (
                          <span className="text-[9px] font-bold text-[#00E5FF] font-mono mb-1">
                            {msg.sender_name}
                          </span>
                        )}

                        <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs font-mono border whitespace-pre-wrap leading-relaxed transition-all ${
                          isSelf 
                            ? "bg-[#151515] border-[#00E5FF]/20 text-white rounded-tr-none" 
                            : "bg-[#090909] border-zinc-800/80 text-zinc-355 rounded-tl-none"
                        }`}>
                          {renderMessageText(msg)}
                        </div>

                        {/* Message Metadata Footer */}
                        <div className={`flex items-center space-x-2.5 text-[8px] font-mono text-zinc-600 mt-1 px-1`}>
                          <span>
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                          <span>•</span>
                          <button 
                            onClick={() => toggleRawPayload(msgId)}
                            className={`flex items-center space-x-1 cursor-pointer transition-colors ${
                              isShowingRaw ? "text-[#00E5FF] font-bold" : "text-zinc-500 hover:text-emerald-400"
                            }`}
                          >
                            <ShieldCheck className={`w-3 h-3 ${isShowingRaw ? "text-[#00E5FF]" : "text-emerald-500/80"}`} />
                            <span>{isShowingRaw ? "SHOWING CIPHER" : "SECURED E2E"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Send Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/80 bg-zinc-900/10 space-y-3 relative">
                
                {/* Emoji quick drawer */}
                {showEmojiPicker && (
                  <div className="flex items-center space-x-1.5 bg-[#050505] p-2 rounded-lg border border-zinc-800/60 max-w-max mb-2 animate-fadeIn absolute bottom-full left-4 z-30">
                    {quickEmojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="hover:scale-125 transition-transform text-sm p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {/* Emoji Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-lg border transition-colors ${
                      showEmojiPicker 
                        ? "bg-amber-950/20 border-amber-800/40 text-amber-400" 
                        : "bg-[#050505] border-zinc-800 text-zinc-500 hover:text-white"
                    }`}
                    title="Insert Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {/* Code Block Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsCodeMode(!isCodeMode)}
                    className={`p-2 rounded-lg border transition-colors ${
                      isCodeMode 
                        ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.1)]" 
                        : "bg-[#050505] border-zinc-800 text-zinc-500 hover:text-white"
                    }`}
                    title="Send as Code Snippet"
                  >
                    <Code className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={
                      isCodeMode 
                        ? "Paste code snippet details here..." 
                        : `Send encrypted message to ${activeTab === "dm" ? selectedUser.full_name : selectedGroup.name}...`
                    }
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-[#050505] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/40"
                    required
                  />
                  
                  <button
                    type="submit"
                    disabled={isSending || !chatInput.trim()}
                    className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)] disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {isCodeMode && (
                  <div className="text-[9px] font-mono text-[#00E5FF] flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                    <span>CODE INGESTION MODE ACTIVE (Snippet formatting will be applied)</span>
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="w-8 h-8 text-zinc-800 mb-2" />
              <p className="text-xs font-mono text-zinc-500">No active communication node selected.</p>
            </div>
          )}

          {/* Access Policy Lock Overlay (CEO Restriction warning) */}
          {activeTab === "dm" && !isCEO && selectedUser && selectedUser.role_tier !== 1 && (
            <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-20">
              <Lock className="w-10 h-10 text-amber-500 mb-4 animate-bounce" />
              <h3 className="text-sm font-bold font-mono text-white tracking-[0.1em] uppercase mb-2">
                EXECUTIVE DEVIATION DETECTED
              </h3>
              <p className="text-xs font-mono text-zinc-400 max-w-md leading-relaxed">
                One-to-one direct messages are strictly restricted to Tier 1 Executive (CEO) nodes only. 
                Non-executive users are barred from establishing direct chat channels with fellow staff members.
              </p>
              <div className="mt-6 p-3 bg-amber-950/20 border border-amber-900/30 rounded max-w-sm">
                <p className="text-[10px] font-mono text-zinc-550">
                  Please use Squad Group channels for all collaboration or contact the CEO directly.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

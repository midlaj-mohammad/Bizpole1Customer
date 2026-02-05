import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Send } from "lucide-react";

const chatsData = [
  {
    id: 1,
    name: "DeadPool",
    avatar: "https://i.pravatar.cc/40?img=1",
    lastMessage: "hai Zam",
    time: "8m",
    hasNotification: true,
    notificationCount: 1,
    messages: [
      { id: 1, sender: "DeadPool", message: "Hey there! 👋", time: "10:30 AM", isOwn: false },
      { id: 2, sender: "You", message: "Hello! How are you?", time: "10:32 AM", isOwn: true },
      { id: 3, sender: "DeadPool", message: "I'm doing great, thanks for asking!", time: "10:33 AM", isOwn: false },
      { id: 4, sender: "DeadPool", message: "hai Zam", time: "10:35 AM", isOwn: false },
    ]
  },
  {
    id: 2,
    name: "Admiral_d",
    avatar: "https://i.pravatar.cc/40?img=2",
    lastMessage: "You are welcome....",
    time: "29m",
    hasNotification: false,
    messages: [
      { id: 1, sender: "You", message: "Thanks for your help!", time: "9:45 AM", isOwn: true },
      { id: 2, sender: "Admiral_d", message: "You are welcome....", time: "9:47 AM", isOwn: false },
    ]
  },
  {
    id: 3,
    name: "Bismark",
    avatar: "https://i.pravatar.cc/40?img=3",
    lastMessage: "Refitting succes...",
    time: "25m",
    hasNotification: false,
    messages: [
      { id: 1, sender: "Bismark", message: "Starting the refitting process", time: "9:50 AM", isOwn: false },
      { id: 2, sender: "You", message: "Good luck with that!", time: "9:52 AM", isOwn: true },
      { id: 3, sender: "Bismark", message: "Refitting success....", time: "9:55 AM", isOwn: false },
    ]
  },
  {
    id: 4,
    name: "Wither_Be.",
    avatar: "https://i.pravatar.cc/40?img=4",
    lastMessage: "Mission Updated..",
    time: "10m",
    hasNotification: false,
    messages: [
      { id: 1, sender: "Wither_Be.", message: "Mission Updated..", time: "10:20 AM", isOwn: false },
      { id: 2, sender: "You", message: "Got it, checking now", time: "10:21 AM", isOwn: true },
    ]
  },
  {
    id: 5,
    name: "Linnin",
    avatar: "https://i.pravatar.cc/40?img=5",
    lastMessage: "Commissione d...",
    time: "5m",
    hasNotification: false,
    messages: [
      { id: 1, sender: "Linnin", message: "Working on the commission", time: "10:25 AM", isOwn: false },
      { id: 2, sender: "Linnin", message: "Commissione done ✅", time: "10:28 AM", isOwn: false },
    ]
  },
  {
    id: 6,
    name: "Stalingrad",
    avatar: "https://i.pravatar.cc/40?img=6",
    lastMessage: "Loc info...",
    time: "1m",
    hasNotification: false,
    messages: [
      { id: 1, sender: "Stalingrad", message: "Loc info shared 📍", time: "10:29 AM", isOwn: false },
    ]
  },
];

export default function ChatListInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState(chatsData);
  const messagesEndRef = useRef(null);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChat = chats.find(chat => chat.id === selectedChat);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat?.messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChat) {
        const newMsg = {
          id: Date.now(),
          sender: "You",
          message: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true
        };
        return {
          ...chat,
          messages: [...chat.messages, newMsg],
          lastMessage: newMessage,
          time: "now"
        };
      }
      return chat;
    });
    
    setChats(updatedChats);
    setNewMessage("");
  };

  const goBack = () => {
    setSelectedChat(null);
  };

  // Chat List View
  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 text-white rounded-3xl overflow-hidden border border-neutral-700">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-lg font-bold">
              🐉
            </div>
            <h1 className="text-xl font-semibold">Chats</h1>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-neutral-700 text-white placeholder-neutral-400 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedChat(chat.id)}
                className="flex items-center gap-3 px-4 py-4 hover:bg-neutral-800 cursor-pointer transition-colors border-b border-neutral-800 last:border-b-0"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {chat.hasNotification ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg font-bold text-black">
                      {chat.name.charAt(0)}
                    </div>
                  ) : (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  {chat.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {chat.notificationCount}
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white truncate">{chat.name}</h3>
                    <span className="text-xs text-neutral-400 flex-shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-sm text-neutral-400 truncate">{chat.lastMessage}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Individual Chat View
  return (
    <div className="flex items-center justify-center  p-4">
      <div className="w-full max-w-md bg-neutral-900 text-white rounded-3xl overflow-hidden border border-neutral-700 flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-700">
          <button 
            onClick={goBack}
            className="p-1 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={currentChat.avatar}
            alt={currentChat.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{currentChat.name}</h2>
            <p className="text-xs text-neutral-400">Active now</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {currentChat.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  message.isOwn
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-neutral-700 text-gray-100 rounded-bl-md'
                }`}
              >
                <p>{message.message}</p>
                <span className="text-[10px] opacity-70 block mt-1">
                  {message.time}
                </span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-neutral-700 text-white placeholder-neutral-400 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useState } from "react";
import {
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Send,
} from "lucide-react";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  const contacts = [
    {
      id: 1,
      name: "David Chen",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Hey Emma, can you send me the",
      time: "2:45 PM",
      unread: true,
      isOnline: true,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Don't forget about our meeting to",
      time: "10:23 AM",
      unread: true,
      isOnline: false,
    },
    {
      id: 3,
      name: "Sarah Johnson",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Don't forget about our meeting to",
      time: "10:23 AM",
      unread: true,
      isOnline: false,
    },
    {
      id: 4,
      name: "Jessica Miller",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Thanks for your help with the pres",
      time: "Friday",
      unread: false,
      isOnline: false,
    },
    {
      id: 5,
      name: "Jessica Miller",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Thanks for your help with the pres",
      time: "Friday",
      unread: false,
      isOnline: false,
    },
    {
      id: 6,
      name: "Robert Williams",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Let's schedule a call to discuss th",
      time: "Wednesday",
      unread: false,
      isOnline: false,
    },
  ];

  const chatMessages = [
    {
      id: 1,
      sender: "David Chen",
      message: "Hi Emma, how are you doing today?",
      time: "2:30 PM",
      isMe: false,
    },
    {
      id: 2,
      sender: "Me",
      message: "Hey David! I'm doing well, thanks for asking. How about you?",
      time: "2:32 PM",
      isMe: true,
    },
    {
      id: 3,
      sender: "David Chen",
      message: "I'm good too. I've been working on the new project design.",
      time: "2:35 PM",
      isMe: false,
    },
    {
      id: 4,
      sender: "David Chen",
      message:
        "Hey Emma, can you send me the design files for the new project?",
      time: "2:43 PM",
      isMe: false,
    },
    {
      id: 5,
      sender: "David Chen",
      message: "I need to review them before our meeting tomorrow.",
      time: "2:45 PM",
      isMe: false,
    },
    {
      id: 6,
      sender: "Me",
      message:
        "Sure, I'll send them over in a few minutes. I just need to finalize a few details.",
      time: "2:50 PM",
      isMe: true,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Contacts */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Unread Messages (5)
          </h2>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                contact.id === 1 ? "bg-blue-50" : ""
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {contact.name.charAt(0)}
                </div>
                {contact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contact.name}
                  </p>
                  <p className="text-xs text-gray-500">{contact.time}</p>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {contact.lastMessage}
                </p>
              </div>

              {contact.unread && (
                <div className="ml-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                D
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  David Chen
                </h3>
                <p className="text-sm text-green-600">Online</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {/* Date Separator */}
          <div className="flex justify-center mb-6">
            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              Today, June 20, 2025
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.isMe
                      ? "bg-[#EB855F] text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.isMe ? "text-orange-100" : "text-gray-500"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <button className="p-2 bg-orange-400 text-white rounded-full hover:bg-orange-500 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

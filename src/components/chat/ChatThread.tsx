"use client";

import { ShiningText } from "@/components/ui/shining-text";

// import { useState } from "react"; // No longer needed

// Message 接口定义，应与 page.tsx 中的保持一致
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  // attachments?: any[]; // 如有需要，保持附件类型定义，与 page.tsx 中的 Message 一致
}

interface ChatThreadProps {
  messages: Message[]; // 从父组件接收 messages
}

export function ChatThread({ messages }: ChatThreadProps) {

  if (!messages || messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">还没有消息...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2"> 
      {messages.map((message: Message) => ( // Explicitly type message here
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          } my-4`}
        >
          {message.role === "user" ? (
            <div className="bg-orange-500 text-white rounded-lg p-4 max-w-xl shadow-md">
              <div className="whitespace-pre-wrap break-words text-base font-medium">{message.content}</div>
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-800 rounded-lg p-4 max-w-xl shadow-md">
              {message.content ? (
                <div className="whitespace-pre-wrap break-words text-base font-medium">{message.content}</div>
              ) : (
                <ShiningText text="死脑子快想..." />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 
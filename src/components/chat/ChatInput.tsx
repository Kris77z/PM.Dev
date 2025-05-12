"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { PureMultimodalInput } from "@/components/ui/multimodal-ai-chat-input";

// 定义附件类型，与 multimodal-ai-chat-input.tsx 中的 Attachment 保持一致或导入（如果允许）
interface AttachmentFromInput {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

// 从 PureMultimodalInput 导入或重新定义 UIMessage 类型 - NO LONGER NEEDED
// interface UIMessage {
//   id: string;
//   content: string;
//   role: string;
//   attachments?: AttachmentFromInput[];
// }

// ChatInput 组件的 Props 定义
interface ChatInputProps {
  onSendMessage: (input: string, attachments?: AttachmentFromInput[]) => void;
  // isGenerating?: boolean; // 如果需要从父组件控制加载状态
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [attachments, setAttachments] = useState<AttachmentFromInput[]>([]);

  const handleSendMessageFromUi = ({ input, attachments: newAttachments }: { input: string; attachments: AttachmentFromInput[] }) => {
    if (!input.trim() && newAttachments.length === 0) return;

    onSendMessage(input, newAttachments);
    setAttachments([]);
  };

  return (
    <div className="flex flex-col w-full">
      <PureMultimodalInput
        chatId="current-chat-input"
        messages={[]} 
        attachments={attachments}
        setAttachments={setAttachments as Dispatch<SetStateAction<AttachmentFromInput[]>>}
        onSendMessage={handleSendMessageFromUi}
        onStopGenerating={() => console.log("Stop generating (ChatInput)")}
        isGenerating={false}
        canSend={true}
        className="w-full max-w-4xl mx-auto"
        selectedVisibilityType="public"
      />
    </div>
  );
} 
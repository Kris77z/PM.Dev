"use client";

import { ArrowRight, Check, ChevronDown, Paperclip, Search } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;

            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface AnimatedAIInputProps {
    onSendMessage: (message: string, selectedModel?: string, enableWebSearch?: boolean) => void;
    placeholder?: string;
    disabled?: boolean;
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
    webSearchEnabled?: boolean;
    onWebSearchToggle?: (enabled: boolean) => void;
}

export function AnimatedAIInput({ 
    onSendMessage, 
    placeholder = "What can I do for you?", 
    disabled = false,
    selectedModel: externalSelectedModel,
    onModelChange,
    webSearchEnabled = false,
    onWebSearchToggle
}: AnimatedAIInputProps) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    });

    // 模型名称到ID的映射
    const MODEL_NAME_TO_ID: Record<string, string> = {
        "GPT-4o": "gpt-4o",
        "Claude-3.7-Sonnet": "claude-3.7-sonnet",
        "Gemini-2.0-Flash": "gemini-2.0-flash",
        "gemini-2.5-flash-preview-05-20": "gemini-2.5-flash-preview-05-20",
        "gemini-2.5-pro-preview-06-05": "gemini-2.5-pro-preview-06-05",
        "DeepSeek: R1 0528": "deepseek-r1",
    };

    // ID到模型名称的映射
    const MODEL_ID_TO_NAME: Record<string, string> = {
        "gpt-4o": "GPT-4o",
        "claude-3.7-sonnet": "Claude-3.7-Sonnet",
        "gemini-2.0-flash": "Gemini-2.0-Flash",
        "gemini-2.5-flash-preview-05-20": "gemini-2.5-flash-preview-05-20",
        "gemini-2.5-pro-preview-06-05": "gemini-2.5-pro-preview-06-05",
        "deepseek-r1": "DeepSeek: R1 0528",
    };

    // 根据外部传入的模型ID获取对应的显示名称
    const getInitialModelName = () => {
        if (externalSelectedModel && MODEL_ID_TO_NAME[externalSelectedModel]) {
            return MODEL_ID_TO_NAME[externalSelectedModel];
        }
        return "GPT-4o"; // 默认值
    };

    const [selectedModel, setSelectedModel] = useState(getInitialModelName());

    const AI_MODELS = [
        "GPT-4o",
        "Claude-3.7-Sonnet",
        "Gemini-2.0-Flash",
        "Gemini-2.5-Flash-preview-05-20",
        "Gemini-2.5-Pro-preview-06-05",
        "DeepSeek: R1 0528",
    ];

    const MODEL_ICONS: Record<string, React.ReactNode> = {
        "GPT-4o": (
            <img 
                src="/icons/openai.svg"
                alt="OpenAI"
                className="w-4 h-4"
            />
        ),
        "Claude-3.7-Sonnet": (
            <img 
                src="/icons/claude.svg"
                alt="Claude"
                className="w-4 h-4"
            />
        ),
        "Gemini-2.0-Flash": (
            <img 
                src="/icons/gemini.svg"
                alt="Gemini"
                className="w-4 h-4"
            />
        ),
        "Gemini-2.5-Flash-preview-05-20": (
            <img 
                src="/icons/gemini.svg"
                alt="Gemini"
                className="w-4 h-4"
            />
        ),
        "Gemini-2.5-Pro-preview-06-05": (
            <img 
                src="/icons/gemini.svg"
                alt="Gemini"
                className="w-4 h-4"
            />
        ),
        "DeepSeek: R1 0528": (
            <img 
                src="/icons/deepseek.svg"
                alt="DeepSeek"
                className="w-4 h-4"
            />
        ),
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && value.trim() && !disabled) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (!value.trim() || disabled) return;
        const modelId = MODEL_NAME_TO_ID[selectedModel] || "gpt-4o";
        onSendMessage(value.trim(), modelId, webSearchEnabled);
        setValue("");
        adjustHeight(true);
    };

    // 检查是否显示Web Search按钮 (Gemini系列模型都支持)
    const showWebSearchButton = selectedModel.startsWith("Gemini-");

    const handleWebSearchToggle = () => {
        onWebSearchToggle?.(!webSearchEnabled);
    };

    const handleModelChange = (model: string) => {
        setSelectedModel(model);
        const modelId = MODEL_NAME_TO_ID[model] || "gpt-4o";
        onModelChange?.(modelId);
    };

    return (
        <div className="w-full py-4">
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5">
                <div className="relative">
                    <div className="relative flex flex-col">
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: "400px" }}
                        >
                            <Textarea
                                id="ai-input-15"
                                value={value}
                                placeholder={placeholder}
                                disabled={disabled}
                                className={cn(
                                    "w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "min-h-[72px]"
                                )}
                                ref={textareaRef}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                            />
                        </div>

                        <div className="h-14 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center">
                            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={selectedModel}
                                                        initial={{
                                                            opacity: 0,
                                                            y: -5,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 5,
                                                        }}
                                                        transition={{
                                                            duration: 0.15,
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {MODEL_ICONS[selectedModel]}
                                                        {selectedModel}
                                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className={cn(
                                                "min-w-[10rem]",
                                                "border-black/10 dark:border-white/10",
                                                "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
                                            )}
                                        >
                                            {AI_MODELS.map((model) => (
                                                <DropdownMenuItem
                                                    key={model}
                                                    onSelect={() =>
                                                        handleModelChange(model)
                                                    }
                                                    className="flex items-center justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {MODEL_ICONS[model]}
                                                        <span>{model}</span>
                                                    </div>
                                                    {selectedModel ===
                                                        model && (
                                                        <Check className="w-4 h-4 text-blue-500" />
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                    
                                    {/* Web Search 按钮 - 只有选择Gemini-2.0-Flash时显示 */}
                                    {showWebSearchButton && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleWebSearchToggle}
                                                className={cn(
                                                    "rounded-lg p-2 cursor-pointer",
                                                    "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                                    "transition-colors",
                                                    webSearchEnabled 
                                                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" 
                                                        : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                                                )}
                                                aria-label="Toggle web search"
                                                title={webSearchEnabled ? "禁用网络搜索" : "启用网络搜索"}
                                            >
                                                <Search className="w-4 h-4 transition-colors" />
                                            </button>
                                            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                        </>
                                    )}
                                    
                                    <label
                                        className={cn(
                                            "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                            "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                            "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                                        )}
                                        aria-label="Attach file"
                                    >
                                        <input type="file" className="hidden" />
                                        <Paperclip className="w-4 h-4 transition-colors" />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                    )}
                                    aria-label="Send message"
                                    disabled={!value.trim() || disabled}
                                    onClick={handleSend}
                                >
                                    <ArrowRight
                                        className={cn(
                                            "w-4 h-4 dark:text-white transition-opacity duration-200",
                                            value.trim() && !disabled
                                                ? "opacity-100"
                                                : "opacity-30"
                                        )}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
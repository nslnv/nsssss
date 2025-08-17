"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, AlertCircle, RefreshCw, Paperclip, X, FileText, Image, FileIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isError?: boolean;
  canRetry?: boolean;
  files?: AttachedFile[];
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: "welcome",
        content: "Привет! Я AI-ассистент Некит Нейронов. Чем могу помочь? Вы можете отправить текст или прикрепить файлы для анализа.",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: AttachedFile[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`Файл "${file.name}" слишком большой. Максимальный размер: 10MB`);
          continue;
        }

        // Validate file type
        const allowedTypes = [
          'text/plain',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          alert(`Неподдерживаемый тип файла: "${file.name}". Поддерживаются: PDF, DOC/DOCX, TXT, изображения`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Ошибка загрузки файла: ${file.name}`);
        }

        const result = await response.json();
        
        newFiles.push({
          id: result.id || Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: result.url || result.path
        });
      }

      setAttachedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Ошибка при загрузке файлов. Попробуйте еще раз.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  const handleSendMessage = async (messageToSend?: string, isRetry = false) => {
    const textToSend = messageToSend || inputMessage;
    if (!textToSend.trim() && attachedFiles.length === 0) return;

    let userMessage: Message;
    
    if (!isRetry) {
      userMessage = {
        id: Date.now().toString(),
        content: textToSend || "📎 Файлы прикреплены",
        role: "user",
        timestamp: new Date(),
        files: attachedFiles.length > 0 ? [...attachedFiles] : undefined
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage("");
      setAttachedFiles([]);
      setRetryCount(0);
    } else {
      // Find the last user message for retry
      const lastUserMessage = messages.slice().reverse().find(msg => msg.role === "user");
      userMessage = lastUserMessage || {
        id: Date.now().toString(),
        content: textToSend,
        role: "user",
        timestamp: new Date(),
      };
    }

    setIsLoading(true);
    setIsTyping(true);

    // Remove any previous error messages if retrying
    if (isRetry) {
      setMessages(prev => prev.filter(msg => !msg.isError));
    }

    try {
      // Format messages for API (exclude error messages)
      const apiMessages = messages.filter(msg => !msg.isError).concat(isRetry ? [] : [userMessage]).map(msg => ({
        role: msg.role,
        content: msg.content,
        files: msg.files?.map(f => ({ name: f.name, type: f.type, url: f.url }))
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          hasFiles: userMessage.files && userMessage.files.length > 0
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }

        // Handle specific error types
        if (response.status === 429) {
          throw new Error("RATE_LIMIT");
        }
        
        console.error("API Error:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorData.error || "Failed to get response"}`);
      }

      const data = await response.json();

      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.message?.content || "Извините, произошла ошибка. Попробуйте еще раз.",
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        setIsLoading(false);
        setRetryCount(0);
      }, 1000);
    } catch (error) {
      console.error("Chat error:", error);
      
      setTimeout(() => {
        let errorMessage: Message;
        
        if (error instanceof Error && error.message === "RATE_LIMIT") {
          const currentRetryCount = retryCount + 1;
          setRetryCount(currentRetryCount);
          
          errorMessage = {
            id: (Date.now() + 1).toString(),
            content: `Превышен лимит запросов к AI. Попробуйте через несколько минут.\n\nПопытка ${currentRetryCount}/3`,
            role: "assistant",
            timestamp: new Date(),
            isError: true,
            canRetry: currentRetryCount < 3,
          };
        } else {
          errorMessage = {
            id: (Date.now() + 1).toString(),
            content: "Извините, произошла техническая ошибка. Проверьте подключение к интернету и попробуйте еще раз.",
            role: "assistant",
            timestamp: new Date(),
            isError: true,
            canRetry: true,
          };
        }

        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleRetry = () => {
    const lastUserMessage = messages.slice().reverse().find(msg => msg.role === "user");
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3F0] text-[#4A3728] flex flex-col">
      {/* Custom CSS */}
      <div className="hidden">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }

            .animate-fade-in-up {
              animation: fadeInUp 0.3s ease-out forwards;
            }

            .animate-scale-in {
              animation: scaleIn 0.2s ease-out forwards;
            }

            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #D4C4B0;
              border-radius: 2px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #A67C5A;
            }

            @keyframes shimmer {
              0% { background-position: -200px 0; }
              100% { background-position: calc(200px + 100%) 0; }
            }

            .typing-shimmer {
              background: linear-gradient(90deg, #E8DDD4 0%, #F7F3F0 20%, #E8DDD4 40%);
              background-size: 200px 100%;
              animation: shimmer 2s infinite;
            }

            .avatar-bounce {
              animation: bounce 2s infinite;
            }

            @keyframes bounce {
              0%, 20%, 53%, 80%, 100% {
                animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
                transform: translate3d(0,0,0);
              }
              40%, 43% {
                animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                transform: translate3d(0, -2px, 0);
              }
              70% {
                animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                transform: translate3d(0, -1px, 0);
              }
              90% {
                transform: translate3d(0,-1px,0);
              }
            }

            .message-hover {
              transition: all 0.2s ease-in-out;
            }

            .message-hover:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(139, 90, 60, 0.1);
            }
          `
        }} />
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
        className="hidden"
      />

      {/* Header */}
      <header className="border-b border-[#D4C4B0] bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#4A3728]">
            <span className="text-[#8B5A3C]">Некит</span> Нейронов
          </h1>
          
          <Link href="/">
            <Button
              variant="ghost" 
              size="sm"
              className="text-[#6B4E3D] hover:bg-[#F0E6D2] hover:text-[#4A3728] transition-all duration-200 rounded-full flex items-center gap-2 px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-medium">На главную</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6 text-center border-b border-[#D4C4B0] bg-gradient-to-b from-[#F7F3F0] to-white">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#8B5A3C] to-[#A67C5A] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-scale-in">
              <Bot className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-semibold mb-3 bg-gradient-to-r from-[#4A3728] to-[#6B4E3D] bg-clip-text text-transparent">
              AI Ассистент Некит Нейронов
            </h2>
            <p className="text-lg text-[#6B4E3D] max-w-2xl mx-auto opacity-80">
              Умный помощник для решения академических задач, консультаций и творческой работы
            </p>
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          style={{ maxHeight: "calc(100vh - 240px)" }}
        >
          <div className="container mx-auto max-w-3xl">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in-up`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {message.role === "assistant" && (
                  <div className={`w-8 h-8 ${
                    message.isError 
                      ? "bg-red-500" 
                      : "bg-gradient-to-br from-[#8B5A3C] to-[#A67C5A]"
                  } rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isTyping && index === messages.length - 1 ? "" : ""
                  }`}>
                    {message.isError ? (
                      <AlertCircle className="w-4 h-4 text-white" strokeWidth={1.5} />
                    ) : (
                      <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
                    )}
                  </div>
                )}
                
                <div className="flex flex-col max-w-[75%]">
                  <div className={`p-3 rounded-2xl message-hover ${
                    message.role === "user" 
                      ? "bg-[#8B5A3C] text-white ml-auto shadow-sm" 
                      : message.isError
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-[#F7F3F0] text-[#4A3728] shadow-sm"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {message.content}
                    </p>
                    
                    {/* File attachments */}
                    {message.files && message.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.files.map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center gap-2 p-2 rounded-xl border ${
                              message.role === "user"
                                ? "bg-white/20 border-white/30"
                                : "bg-white border-[#E0D0BD]"
                            }`}
                          >
                            <div className="text-[#8B5A3C]">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.name}</p>
                              <p className="text-xs opacity-70">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <span className={`text-xs mt-2 block font-normal ${
                      message.role === "user" 
                        ? "text-white/70" 
                        : message.isError 
                          ? "text-red-500"
                          : "text-[#6B4E3D]/70"
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {/* Retry Button */}
                  {message.isError && message.canRetry && (
                    <Button
                      onClick={handleRetry}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="mt-2 self-start bg-transparent border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 rounded-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" strokeWidth={1.5} />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      )}
                      Повторить
                    </Button>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 bg-[#D4C4B0] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-[#6B4E3D]" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-fade-in-up">
                <div className="w-8 h-8 bg-gradient-to-br from-[#8B5A3C] to-[#A67C5A] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm avatar-bounce">
                  <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
                </div>
                <div className="bg-[#F7F3F0] p-3 rounded-2xl shadow-sm typing-shimmer">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#8B5A3C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-[#8B5A3C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-[#8B5A3C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#E8DDD4] bg-white p-4">
          <div className="container mx-auto max-w-3xl">
            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#6B4E3D] font-medium">
                  <Paperclip className="w-4 h-4" strokeWidth={1.5} />
                  Прикрепленные файлы:
                </div>
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 bg-[#F7F3F0] border border-[#D4C4B0] rounded-xl p-2 text-sm shadow-sm animate-scale-in"
                    >
                      <div className="text-[#8B5A3C]">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate max-w-32 text-[#4A3728]">{file.name}</p>
                        <p className="text-xs text-[#6B4E3D]">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        onClick={() => removeFile(file.id)}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:bg-red-50 hover:text-red-500 rounded-full"
                      >
                        <X className="w-3 h-3" strokeWidth={2} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 items-end">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                variant="ghost"
                size="sm"
                className="text-[#6B4E3D] hover:bg-[#F0E6D2] hover:text-[#4A3728] disabled:opacity-50 rounded-full p-2 h-10 w-10 flex-shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Paperclip className="w-5 h-5" strokeWidth={1.5} />
                )}
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите сообщение..."
                  className="bg-[#F7F3F0] border-[#D4C4B0] text-[#4A3728] placeholder-[#8B5A3C]/60 focus:border-[#8B5A3C] focus:ring-1 focus:ring-[#8B5A3C]/20 rounded-3xl px-4 py-3 pr-12 resize-none font-medium"
                  disabled={isLoading}
                />
              </div>
              
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || (!inputMessage.trim() && attachedFiles.length === 0)}
                className="bg-[#8B5A3C] hover:bg-[#704832] text-white rounded-full p-2 h-10 w-10 flex-shrink-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Send className="w-5 h-5" strokeWidth={1.5} />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-[#6B4E3D]/70 mt-3 text-center font-medium">
              Enter для отправки • Поддерживаются PDF, DOC, TXT, изображения до 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
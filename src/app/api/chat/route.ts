import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

// Initialize OpenAI for OpenRouter API
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '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',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'NSLNV AI Assistant'
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const systemPrompt = `You are a professional AI assistant for client conversations. You should be:

1. Helpful and knowledgeable across various topics
2. Professional yet approachable in tone
3. Clear and concise in your responses
4. Patient and understanding with client needs
5. Focused on providing actionable solutions
6. Respectful of client confidentiality and privacy

When users attach files, you can analyze and work with:
- PDF documents
- Word documents (DOC/DOCX)
- Text files
- Images (for analysis, description, or OCR if needed)

Always acknowledge when files are attached and provide specific analysis or assistance based on the file content.

Always aim to provide high-quality, accurate information while maintaining a friendly professional demeanor. If you're unsure about something, be honest about limitations rather than making assumptions.`

// Rate limiting and retry logic
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function makeOpenAIRequest(messagesWithSystem: any[], retryCount = 0): Promise<any> {
  const maxRetries = 3
  const baseDelay = 1000 // 1 second

  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo', // OpenRouter format for GPT-3.5
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 1500, // Increased for file analysis
    })

    return completion
  } catch (error: any) {
    console.error(`OpenRouter API attempt ${retryCount + 1} failed:`, {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
    })

    // If it's a rate limit error and we haven't exceeded max retries
    if (error?.status === 429 && retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount) // Exponential backoff
      console.log(`Rate limited, retrying in ${delay}ms...`)
      await sleep(delay)
      return makeOpenAIRequest(messagesWithSystem, retryCount + 1)
    }

    // Re-throw the error if we can't retry or it's not a rate limit error
    throw error
  }
}

async function processFileContent(files: any[]): Promise<string> {
  if (!files || files.length === 0) return ''

  let fileContent = '\n\n📎 Прикрепленные файлы:\n'
  
  for (const file of files) {
    try {
      fileContent += `\n--- Файл: ${file.name} (${file.type}) ---\n`
      
      // Handle different file types
      if (file.type === 'text/plain') {
        // Read text files
        const filePath = path.join(process.cwd(), 'public', file.url)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8')
          fileContent += content.substring(0, 2000) // Limit to 2000 chars
          if (content.length > 2000) {
            fileContent += '\n[... файл обрезан ...]'
          }
        } else {
          fileContent += '[Файл не найден или недоступен]'
        }
      } else if (file.type.startsWith('image/')) {
        // For images, provide basic info
        fileContent += '[Изображение прикреплено - готов к анализу визуального контента]'
      } else if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('document')) {
        // For PDFs and Word docs, note that they're attached
        fileContent += '[Документ прикреплен - готов к анализу содержимого документа]'
      } else {
        fileContent += '[Файл прикреплен - тип файла может быть проанализирован]'
      }
      
      fileContent += '\n'
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error)
      fileContent += '[Ошибка при обработке файла]\n'
    }
  }
  
  return fileContent
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API: Request received')
    
    // Check if OpenRouter API key is available
    if (!process.env.OPENROUTER_API_KEY && !openai.apiKey) {
      console.error('Chat API: No OpenRouter API key found')
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again later.' },
        { status: 503, headers: corsHeaders }
      )
    }

    const { messages, hasFiles = false } = await request.json()
    console.log('Chat API: Messages parsed', { messageCount: messages?.length, hasFiles })

    if (!messages || !Array.isArray(messages)) {
      console.error('Chat API: Invalid messages format')
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Limit message history to prevent token overflow
    const recentMessages = messages.slice(-10) // Keep last 10 messages

    // Process files if any are attached to the latest message
    let processedMessages = [...recentMessages]
    const lastMessage = processedMessages[processedMessages.length - 1]
    
    if (lastMessage?.files && lastMessage.files.length > 0) {
      console.log('Chat API: Processing attached files', lastMessage.files.length)
      const fileContent = await processFileContent(lastMessage.files)
      
      // Append file content to the last message
      processedMessages[processedMessages.length - 1] = {
        ...lastMessage,
        content: lastMessage.content + fileContent
      }
    }

    // Add system prompt to messages
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...processedMessages
    ]

    console.log('Chat API: Calling OpenRouter API with retry logic')

    // Use retry logic for better error handling
    const completion = await makeOpenAIRequest(messagesWithSystem)

    console.log('Chat API: OpenRouter response received')

    const message = completion.choices[0]?.message

    if (!message) {
      console.error('Chat API: No message in OpenRouter response')
      return NextResponse.json(
        { error: 'No response generated. Please try again.' },
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('Chat API: Success')

    return NextResponse.json(
      {
        message: {
          role: message.role,
          content: message.content
        },
        usage: completion.usage,
        model: completion.model
      },
      { headers: corsHeaders }
    )

  } catch (error: any) {
    console.error('Chat API: Final error after retries:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
    })

    // Handle specific OpenAI errors with user-friendly messages
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed. Please contact support.' },
        { status: 503, headers: corsHeaders }
      )
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429, 
          headers: {
            ...corsHeaders,
            'Retry-After': '60' // Suggest retry after 60 seconds
          }
        }
      )
    }

    if (error?.status === 400) {
      return NextResponse.json(
        { error: 'Invalid request. Please check your message and try again.' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable due to quota limits.' },
        { status: 503, headers: corsHeaders }
      )
    }

    if (error?.code === 'model_not_found') {
      return NextResponse.json(
        { error: 'AI model temporarily unavailable. Please try again later.' },
        { status: 503, headers: corsHeaders }
      )
    }

    // Network or connection errors
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Connection error. Please check your internet connection and try again.' },
        { status: 503, headers: corsHeaders }
      )
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a few minutes.' },
      { status: 500, headers: corsHeaders }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = "qweqweqwe112233";

// Default content structure that matches the admin dashboard expectations
const defaultContent = {
  settings: {
    brand: "НИКИТА/NSLNV",
    accent: "peach"
  },
  hero: {
    title: "НИКИТА/NSLNV",
    subtitle: "Эксперт в области права, образования и IT",
    lead: "Профессиональная помощь студентам и специалистам в юридических, педагогических, технических и гуманитарных вопросах",
    available: "Онлайн 24/7",
    ctaPrimary: "Заказать работу",
    ctaSecondary: "Подробнее"
  },
  platforms: [],
  works: [],
  testimonials: [
    {
      text: "Никита помог мне с дипломной работой по юриспруденции. Профессиональный подход, качественная работа и соблюдение всех сроков. Рекомендую!",
      author: "Анна Петрова, студент МГУ"
    },
    {
      text: "Обратился за правовой консультацией при заключении важного договора. Получил исчерпывающие ответы и практические рекомендации.",
      author: "Михаил Сидоров, предприниматель"
    },
    {
      text: "Сотрудничество с Никитой в разработке образовательных программ было очень продуктивным. Креативный подход и глубокие знания.",
      author: "Елена Козлова, преподаватель"
    }
  ],
  contacts: {
    email: "niksol2000@yandex.ru",
    telegram: "@nslnv",
    whatsapp: "+7 (999) 123-45-67",
    vk: "https://vk.com/nslnv",
    phone: "+7 (999) 123-45-67",
    studwork: "https://studwork.org/nslnv"
  }
};

export async function GET() {
  try {
    return NextResponse.json(defaultContent);
  } catch (error) {
    console.error('Error getting content:', error);
    return NextResponse.json(
      { error: 'Failed to get content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check token authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const updatedContent = await request.json();

    // In a real implementation, you would save this to a database
    // For now, we'll just return the updated content
    console.log('Content updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      ...updatedContent
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQuestions } from '@/lib/ai';
import { PurposeInput, Question } from '@/types/survey';

// GET: Purpose一覧取得（期限切れでないもののみ）
export async function GET() {
  try {
    const purposes = await prisma.purpose.findMany({
      where: {
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        shareToken: true,
        deadline: true,
        createdAt: true,
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json(purposes);
  } catch (error) {
    console.error('Failed to fetch purposes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purposes' },
      { status: 500 }
    );
  }
}

// POST: Purpose作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, questions, deadline } = body;

    if (!title || !description || !questions) {
      return NextResponse.json(
        { error: 'Title, description, and questions are required' },
        { status: 400 }
      );
    }

    const purpose = await prisma.purpose.create({
      data: {
        title,
        description,
        questions,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json(purpose);
  } catch (error) {
    console.error('Failed to create purpose:', error);
    return NextResponse.json(
      { error: 'Failed to create purpose' },
      { status: 500 }
    );
  }
}

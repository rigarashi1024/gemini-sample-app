import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQuestions } from '@/lib/ai';
import { PurposeInput, Question } from '@/types/survey';

// GET: Purpose一覧取得（期限切れでないもののみ）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get('createdBy');

    const where: any = {
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    };

    // createdByパラメータがある場合はフィルタリング
    if (createdBy) {
      where.createdBy = createdBy;
    }

    const purposes = await prisma.purpose.findMany({
      where,
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
    const { title, description, questions, deadline, createdBy } = body;

    if (!title || !description || !questions) {
      return NextResponse.json(
        { error: 'Title, description, and questions are required' },
        { status: 400 }
      );
    }

    if (!createdBy) {
      return NextResponse.json(
        { error: 'createdBy (clientId) is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions must be a non-empty array' },
        { status: 400 }
      );
    }

    const purpose = await prisma.purpose.create({
      data: {
        title,
        description,
        questions,
        deadline: deadline ? new Date(deadline) : null,
        createdBy,
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

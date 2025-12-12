import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/ai';
import { PurposeInput } from '@/types/survey';

// POST: AIで質問を生成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body as PurposeInput;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const questions = await generateQuestions({ title, description });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Failed to generate questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

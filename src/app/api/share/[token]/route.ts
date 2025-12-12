import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: shareTokenからPurposeを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const purpose = await prisma.purpose.findUnique({
      where: {
        shareToken: params.token,
      },
      select: {
        id: true,
        title: true,
        description: true,
        questions: true,
        deadline: true,
        createdAt: true,
      },
    });

    if (!purpose) {
      return NextResponse.json(
        { error: 'Purpose not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(purpose);
  } catch (error) {
    console.error('Failed to fetch purpose by token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purpose' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Purpose詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purpose = await prisma.purpose.findUnique({
      where: {
        id: params.id,
      },
      include: {
        responses: true,
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
    console.error('Failed to fetch purpose:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purpose' },
      { status: 500 }
    );
  }
}

// PUT: Purpose更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, questions, deadline } = body;

    const purpose = await prisma.purpose.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        questions,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json(purpose);
  } catch (error) {
    console.error('Failed to update purpose:', error);
    return NextResponse.json(
      { error: 'Failed to update purpose' },
      { status: 500 }
    );
  }
}

// DELETE: Purpose削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.purpose.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete purpose:', error);
    return NextResponse.json(
      { error: 'Failed to delete purpose' },
      { status: 500 }
    );
  }
}

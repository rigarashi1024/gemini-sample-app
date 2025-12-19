import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 回答済みアンケート一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // ResponseからclientIdで検索し、紐づくPurpose情報をJOINして取得
    const responses = await prisma.response.findMany({
      where: {
        clientId,
      },
      select: {
        id: true,
        purposeId: true,
        createdAt: true,
        purpose: {
          select: {
            id: true,
            title: true,
            description: true,
            shareToken: true,
            deadline: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Purpose情報のみを抽出（重複除去）
    const purposesMap = new Map();
    responses.forEach((response) => {
      if (!purposesMap.has(response.purpose.id)) {
        purposesMap.set(response.purpose.id, response.purpose);
      }
    });

    const purposes = Array.from(purposesMap.values());

    return NextResponse.json(purposes);
  } catch (error) {
    console.error('Failed to fetch answered surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answered surveys' },
      { status: 500 }
    );
  }
}

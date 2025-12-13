'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, FileText, BarChart3, Edit } from 'lucide-react';
import { getPurposeSurveyStorage } from '@/lib/storage';

type Purpose = {
  id: string;
  title: string;
  description: string;
  shareToken: string;
  deadline: string | null;
  createdAt: string;
  _count: {
    responses: number;
  };
};

export default function Home() {
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeredPurposeIds, setAnsweredPurposeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPurposes();

    // localStorageから回答済みのpurposeIdを取得
    if (typeof window !== 'undefined') {
      const storage = getPurposeSurveyStorage();
      if (storage) {
        const answeredIds = new Set(
          storage.purposes.filter(p => p.hasAnswer).map(p => p.id)
        );
        setAnsweredPurposeIds(answeredIds);
      }
    }
  }, []);

  const fetchPurposes = async () => {
    try {
      const response = await fetch('/api/purposes');
      const data = await response.json();
      setPurposes(data);
    } catch (error) {
      console.error('Failed to fetch purposes:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyShareUrl = (shareToken: string) => {
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    alert('共有URLをコピーしました');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            PurposeSurvey
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            目的を入力するだけで、AIが最適なアンケートを自動生成
          </p>
          <Link href="/create">
            <Button size="lg" className="shadow-lg">
              <FileText className="mr-2 h-5 w-5" />
              アンケートを作成
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            作成済みアンケート
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">読み込み中...</p>
            </div>
          ) : purposes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">
                  まだアンケートが作成されていません
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {purposes.map((purpose) => (
                <Card key={purpose.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{purpose.title}</span>
                      <span className="text-sm font-normal text-slate-500">
                        回答数: {purpose._count.responses}
                      </span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {purpose.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShareUrl(purpose.shareToken)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        共有URLをコピー
                      </Button>
                      <Link href={`/analysis/${purpose.id}`}>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          集計を確認
                        </Button>
                      </Link>
                      {answeredPurposeIds.has(purpose.id) && (
                        <Link href={`/share/${purpose.shareToken}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            自分の回答を編集
                          </Button>
                        </Link>
                      )}
                      {purpose.deadline && (
                        <span className="text-sm text-slate-500 self-center ml-auto">
                          締切: {new Date(purpose.deadline).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Edit } from 'lucide-react';
import { hasAnswered } from '@/lib/storage';

type Aggregation = {
  questionId: string;
  label: string;
  type: string;
  totalResponses: number;
  distribution?: Record<string, number>;
  min?: number;
  max?: number;
  average?: number;
  responses?: string[];
  dates?: string[];
  ranges?: any[];
};

type AnalysisData = {
  purpose: {
    id: string;
    title: string;
    description: string;
    deadline: string | null;
    shareToken: string;
  };
  aggregation: Aggregation[];
  aiSummary: {
    insights: string;
    recommendations: string;
  } | null;
  totalResponses: number;
};

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  useEffect(() => {
    if (data && data.purpose) {
      setIsAnswered(hasAnswered(data.purpose.id));
    }
  }, [data]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`/api/analysis/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const analysisData = await response.json();
      setData(analysisData);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      alert('集計データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const renderAggregation = (agg: Aggregation) => {
    switch (agg.type) {
      case 'single_choice':
      case 'multi_choice':
      case 'tags':
        return (
          <div className="space-y-2">
            {agg.distribution &&
              Object.entries(agg.distribution).map(([option, count]) => (
                <div key={option} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{option}</span>
                      <span className="text-sm text-slate-500">
                        {count}件 (
                        {((count / agg.totalResponses) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(count / agg.totalResponses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );

      case 'number':
      case 'scale':
      case 'rating':
        const isValidMin = typeof agg.min === 'number' && isFinite(agg.min);
        const isValidAvg = typeof agg.average === 'number' && isFinite(agg.average);
        const isValidMax = typeof agg.max === 'number' && isFinite(agg.max);

        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500">最小値</p>
              <p className="text-2xl font-semibold">
                {isValidMin ? agg.min : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">平均値</p>
              <p className="text-2xl font-semibold">
                {isValidAvg ? agg.average.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">最大値</p>
              <p className="text-2xl font-semibold">
                {isValidMax ? agg.max : 'N/A'}
              </p>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            {agg.responses?.slice(0, 10).map((response, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-md text-sm"
              >
                {response}
              </div>
            ))}
            {agg.responses && agg.responses.length > 10 && (
              <p className="text-sm text-slate-500">
                他 {agg.responses.length - 10} 件の回答
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-1">
            {agg.dates?.map((date, idx) => (
              <div key={idx} className="text-sm">
                {new Date(date).toLocaleDateString('ja-JP')}
              </div>
            ))}
          </div>
        );

      default:
        return <p className="text-sm text-slate-500">集計データなし</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>データが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              トップに戻る
            </Button>
          </Link>
          {isAnswered && (
            <Link href={`/share/${data.purpose.shareToken}`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                自分の回答を編集
              </Button>
            </Link>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{data.purpose.title}</CardTitle>
            <CardDescription>{data.purpose.description}</CardDescription>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <span>総回答数: {data.totalResponses}件</span>
              {data.purpose.deadline && (
                <span>
                  締切: {new Date(data.purpose.deadline).toLocaleDateString('ja-JP')}
                </span>
              )}
            </div>
          </CardHeader>
        </Card>

        {data.aiSummary && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <TrendingUp className="mr-2 h-5 w-5" />
                AI分析結果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  インサイト・要約
                </h3>
                <p className="text-blue-800 whitespace-pre-wrap">
                  {data.aiSummary.insights}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  推奨アクション
                </h3>
                <p className="text-blue-800 whitespace-pre-wrap">
                  {data.aiSummary.recommendations}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">質問別集計</h2>
          {data.aggregation.map((agg, index) => (
            <Card key={agg.questionId}>
              <CardHeader>
                <CardTitle className="text-base">
                  質問 {index + 1}: {agg.label}
                </CardTitle>
                <p className="text-sm text-slate-500">
                  回答数: {agg.totalResponses}件
                </p>
              </CardHeader>
              <CardContent>{renderAggregation(agg)}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

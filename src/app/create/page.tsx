'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim() || !description.trim()) {
      alert('タイトルと目的の両方を入力してください');
      return;
    }

    setLoading(true);

    try {
      // 質問生成APIを呼び出す
      const response = await fetch('/api/purposes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();

      // 生成されたデータを次のページに渡す
      const params = new URLSearchParams({
        title,
        description,
        questions: JSON.stringify(data.questions),
      });

      router.push(`/edit?${params.toString()}`);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('質問の生成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">アンケートの目的を入力</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                placeholder="例: チームランチの店決め"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">目的・詳細</Label>
              <Textarea
                id="description"
                placeholder="例: 来週の金曜日にチームでランチに行きたいです。みんなの希望を聞いて、最適なお店を決めたいと思います。予算は1人3000円以内、場所は渋谷周辺を考えています。"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-sm text-slate-500">
                できるだけ詳しく目的や背景を記載してください。AIがより適切な質問を生成します。
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !title.trim() || !description.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                '生成中...'
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  AIでアンケート生成
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

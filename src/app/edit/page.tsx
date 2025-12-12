'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Question } from '@/types/survey';

function EditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const titleParam = searchParams.get('title');
    const descriptionParam = searchParams.get('description');
    const questionsParam = searchParams.get('questions');

    if (titleParam) setTitle(titleParam);
    if (descriptionParam) setDescription(descriptionParam);
    if (questionsParam) {
      try {
        setQuestions(JSON.parse(questionsParam));
      } catch (error) {
        console.error('Failed to parse questions:', error);
      }
    }
  }, [searchParams]);

  const handleRegenerate = async () => {
    if (!title.trim() || !description.trim()) {
      alert('タイトルと目的が必要です');
      return;
    }

    setRegenerating(true);

    try {
      const response = await fetch('/api/purposes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
      alert('質問を再生成しました');
    } catch (error) {
      console.error('Failed to regenerate questions:', error);
      alert('質問の再生成に失敗しました');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || questions.length === 0) {
      alert('すべての項目を入力してください');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/purposes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          questions,
          deadline: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save purpose');
      }

      alert('アンケートを保存しました');
      router.push('/');
    } catch (error) {
      console.error('Failed to save purpose:', error);
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/create">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">アンケート確認・編集</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>タイトル</Label>
              <p className="text-lg font-semibold">{title}</p>
            </div>
            <div>
              <Label>目的</Label>
              <p className="text-slate-600">{description}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {regenerating ? '再生成中...' : 'アンケート再生成'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-6">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor={`question-${index}`}>
                        質問 {index + 1}
                      </Label>
                      <Input
                        id={`question-${index}`}
                        value={question.label}
                        onChange={(e) =>
                          updateQuestion(index, 'label', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>質問形式</Label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(index, 'type', e.target.value)
                          }
                        >
                          <option value="single_choice">単一選択</option>
                          <option value="multi_choice">複数選択</option>
                          <option value="text">自由記述</option>
                          <option value="number">数値</option>
                          <option value="date">日付</option>
                          <option value="scale">スケール</option>
                          <option value="rating">評価</option>
                        </select>
                      </div>
                      <div>
                        <Label>必須</Label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={question.required ? 'true' : 'false'}
                          onChange={(e) =>
                            updateQuestion(
                              index,
                              'required',
                              e.target.value === 'true'
                            )
                          }
                        >
                          <option value="true">はい</option>
                          <option value="false">いいえ</option>
                        </select>
                      </div>
                    </div>
                    {question.options && (
                      <div>
                        <Label>選択肢</Label>
                        <p className="text-sm text-slate-600">
                          {question.options.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteQuestion(index)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={loading || questions.length === 0}
            className="flex-1"
            size="lg"
          >
            {loading ? (
              '保存中...'
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                保存してトップへ
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <EditPageContent />
    </Suspense>
  );
}

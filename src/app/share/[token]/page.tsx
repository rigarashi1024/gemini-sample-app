'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, AlertCircle } from 'lucide-react';
import { Question, Answer, AnswerValue } from '@/types/survey';
import { getOrCreateClientId, hasAnswered, markAsAnswered } from '@/lib/storage';

type PurposeData = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  deadline: string | null;
};

export default function SharePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [purpose, setPurpose] = useState<PurposeData | null>(null);
  const [respondentName, setRespondentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientId, setClientId] = useState<string>('');
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);

  // clientIdの初期化とpurpose情報の登録（最初に実行）
  useEffect(() => {
    if (purpose) {
      const id = getOrCreateClientId(purpose.id);
      setClientId(id);

      // すでに回答済みかチェック
      setAlreadyAnswered(hasAnswered(purpose.id));
    }
  }, [purpose]);

  const fetchPurpose = useCallback(async () => {
    try {
      const response = await fetch(`/api/share/${token}`);
      if (!response.ok) {
        throw new Error('Purpose not found');
      }
      const data = await response.json();
      setPurpose(data);
    } catch (error) {
      console.error('Failed to fetch purpose:', error);
      alert('アンケートが見つかりませんでした');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchExistingResponse = useCallback(async () => {
    if (!purpose || !clientId) return;

    try {
      const response = await fetch(
        `/api/responses?purposeId=${purpose.id}&clientId=${clientId}`
      );

      if (response.ok) {
        const data = await response.json();
        // 既存の回答をフォームに反映
        if (data.answers) {
          const answersMap: Record<string, AnswerValue> = {};
          (data.answers as Answer[]).forEach((answer) => {
            answersMap[answer.questionId] = answer.value;
          });
          setAnswers(answersMap);
        }
        // 回答者名も反映（nullの場合は空文字列にする）
        setRespondentName(data.respondentName || '');
      } else if (response.status === 404) {
        // 回答が存在しない場合は何もしない（新規回答）
        console.log('No existing response found');
      } else {
        console.error('Failed to fetch existing response');
      }
    } catch (error) {
      console.error('Error fetching existing response:', error);
    }
  }, [purpose, clientId]);

  // tokenが変わったらPurposeデータを取得
  useEffect(() => {
    if (token) {
      fetchPurpose();
    }
  }, [token, fetchPurpose]);

  // purposeとclientIdが両方揃ったら、既存の回答を取得する
  useEffect(() => {
    if (purpose && clientId) {
      fetchExistingResponse();
    }
  }, [purpose, clientId, fetchExistingResponse]);

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!purpose) return;

    // 必須質問のチェック
    const missingRequired = purpose.questions.filter(
      (q) => q.required && !answers[q.id]
    );

    if (missingRequired.length > 0) {
      alert('必須項目に回答してください');
      return;
    }

    setSubmitting(true);

    try {
      // 回答データの整形
      const formattedAnswers: Answer[] = purpose.questions.map((q) => ({
        questionId: q.id,
        value: answers[q.id] || null,
      }));

      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purposeId: purpose.id,
          clientId,
          respondentName: respondentName || null,
          answers: formattedAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      // localStorageのhasAnswerフラグを更新
      markAsAnswered(purpose.id);

      alert('回答を送信しました');
      router.push(`/analysis/${purpose.id}`);
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('回答の送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="h-4 w-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={
                    Array.isArray(answers[question.id]) &&
                    (answers[question.id] as string[]).includes(option)
                  }
                  onChange={(e) => {
                    const current = (answers[question.id] as string[]) || [];
                    const newValue = e.target.checked
                      ? [...current, option]
                      : current.filter((v) => v !== option);
                    handleAnswerChange(question.id, newValue);
                  }}
                  className="h-4 w-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={(answers[question.id] as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="回答を入力してください"
          />
        );

      case 'number':
      case 'scale':
      case 'rating':
        return (
          <Input
            type="number"
            value={answers[question.id] !== undefined && answers[question.id] !== null ? answers[question.id] as number : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                handleAnswerChange(question.id, question.required ? undefined : null);
              } else {
                const numValue = Number(value);
                handleAnswerChange(question.id, isNaN(numValue) ? null : numValue);
              }
            }}
            placeholder="数値を入力"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={(answers[question.id] as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      default:
        return (
          <Input
            value={(answers[question.id] as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="回答を入力してください"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!purpose) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>アンケートが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {alreadyAnswered && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">
                    このブラウザはすでにこのアンケートに回答済みです
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    回答を編集して再送信することができます。送信すると以前の回答が上書きされます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{purpose.title}</CardTitle>
            <CardDescription>{purpose.description}</CardDescription>
            {purpose.deadline && (
              <p className="text-sm text-slate-500 mt-2">
                締切: {new Date(purpose.deadline).toLocaleDateString('ja-JP')}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="respondentName">お名前（任意）</Label>
              <Input
                id="respondentName"
                placeholder="匿名でも回答できます"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-6">
          {purpose.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <Label className="text-base">
                  質問 {index + 1}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <p className="text-sm text-slate-700">{question.label}</p>
              </CardHeader>
              <CardContent>{renderQuestionInput(question)}</CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            '送信中...'
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              回答を送信
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

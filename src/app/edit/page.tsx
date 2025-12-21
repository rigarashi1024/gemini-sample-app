'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, RefreshCw, Trash2, Plus, X, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { Question } from '@/types/survey';
import { getOrCreateClientId } from '@/lib/storage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ソート可能な質問カードコンポーネント
function SortableQuestionCard({
  question,
  index,
  updateQuestion,
  deleteQuestion,
  addOption,
  removeOption,
}: {
  question: Question;
  index: number;
  updateQuestion: (index: number, field: keyof Question, value: any) => void;
  deleteQuestion: (index: number) => void;
  addOption: (questionIndex: number, newOption: string) => void;
  removeOption: (questionIndex: number, optionToRemove: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <button
              className="mt-2 cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-slate-400" />
            </button>
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
              {(question.type === 'single_choice' ||
                question.type === 'multi_choice' ||
                question.type === 'scale' ||
                question.type === 'rating' ||
                question.type === 'tags') && (
                <div className="space-y-2">
                  <Label>選択肢</Label>
                  <div className="space-y-1">
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2 group">
                        <span className="flex-1 text-sm">{option}</span>
                        <button
                          type="button"
                          onClick={() => removeOption(index, option)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                          title="選択肢を削除"
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Input
                      type="text"
                      placeholder="新しい選択肢を追加"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOption(index, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input && input.value) {
                          addOption(index, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
  );
}

function EditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      // localStorageからclientIdを取得または生成
      const clientId = getOrCreateClientId();

      const response = await fetch('/api/purposes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          questions,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          createdBy: clientId,
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };

    // 質問タイプが変更され、新しいタイプがoptionsをサポートしない場合はクリア
    if (field === 'type') {
      const optionSupportedTypes = ['single_choice', 'multi_choice', 'scale', 'rating', 'tags'];
      if (!optionSupportedTypes.includes(value)) {
        newQuestions[index].options = undefined;
      }
    }

    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number, newOption: string) => {
    if (!newOption.trim()) return;

    const newQuestions = [...questions];
    const currentOptions = newQuestions[questionIndex].options || [];

    // 大文字小文字を区別しない重複チェック
    const trimmedOption = newOption.trim();
    if (currentOptions.some(opt => opt.toLowerCase() === trimmedOption.toLowerCase())) return;

    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: [...currentOptions, trimmedOption]
    };
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionToRemove: string) => {
    const newQuestions = [...questions];
    const currentOptions = newQuestions[questionIndex].options || [];

    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: currentOptions.filter(opt => opt !== optionToRemove)
    };
    setQuestions(newQuestions);
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <SortableQuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  updateQuestion={updateQuestion}
                  deleteQuestion={deleteQuestion}
                  addOption={addOption}
                  removeOption={removeOption}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">アンケート締切日（任意）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="deadline">締切日時</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="text-sm text-slate-500">
                締切日を設定しない場合は空欄のままにしてください
              </p>
            </div>
          </CardContent>
        </Card>

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

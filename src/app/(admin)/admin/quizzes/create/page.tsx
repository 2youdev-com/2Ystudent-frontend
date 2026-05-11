'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { quizApi } from '@/lib/api/quiz.api';
import type { CreateQuizInput, CreateQuestionInput, CreateOptionInput } from '@/types/quiz';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Save,
  Loader2,
  Sparkles,
  ClipboardCheck,
  HelpCircle,
  GripVertical,
} from 'lucide-react';

function emptyOption(order: number): CreateOptionInput {
  return { optionText: '', optionTextAr: '', isCorrect: false, orderInQuestion: order };
}

function emptyQuestion(order: number): CreateQuestionInput {
  return {
    questionText: '',
    questionTextAr: '',
    questionType: 'multiple_choice',
    explanation: '',
    explanationAr: '',
    points: 1,
    orderInQuiz: order,
    options: [emptyOption(0), emptyOption(1), emptyOption(2), emptyOption(3)],
  };
}

export default function CreateQuizPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [maxAttempts, setMaxAttempts] = useState<string>('');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [questions, setQuestions] = useState<CreateQuestionInput[]>([emptyQuestion(0)]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genCount, setGenCount] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length)]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderInQuiz: i })));
  };

  const updateQuestion = (idx: number, updates: Partial<CreateQuestionInput>) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, ...updates } : q));
  };

  const updateOption = (qIdx: number, oIdx: number, updates: Partial<CreateOptionInput>) => {
    setQuestions((prev) => prev.map((q, qi) => {
      if (qi !== qIdx) return q;
      const newOpts = q.options.map((o, oi) => oi === oIdx ? { ...o, ...updates } : o);
      return { ...q, options: newOpts };
    }));
  };

  const setCorrectOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) => prev.map((q, qi) => {
      if (qi !== qIdx) return q;
      const newOpts = q.options.map((o, oi) => ({ ...o, isCorrect: oi === oIdx }));
      return { ...q, options: newOpts };
    }));
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) => prev.map((q, qi) => {
      if (qi !== qIdx) return q;
      return { ...q, options: [...q.options, emptyOption(q.options.length)] };
    }));
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) => prev.map((q, qi) => {
      if (qi !== qIdx || q.options.length <= 2) return q;
      return {
        ...q,
        options: q.options.filter((_, i) => i !== oIdx).map((o, i) => ({ ...o, orderInQuestion: i })),
      };
    }));
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }
    if (questions.some((q) => !q.questionText.trim())) {
      setError('All questions must have text');
      return;
    }
    if (questions.some((q) => !q.options.some((o) => o.isCorrect))) {
      setError('Each question must have a correct answer');
      return;
    }
    if (questions.some((q) => q.options.some((o) => !o.optionText.trim()))) {
      setError('All options must have text');
      return;
    }

    setSaving(true);
    try {
      const data: CreateQuizInput = {
        title: title.trim(),
        titleAr: titleAr.trim() || undefined,
        description: description.trim(),
        descriptionAr: descriptionAr.trim() || undefined,
        difficulty,
        passingScore,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : undefined,
        shuffleQuestions,
        showCorrectAnswers,
        questions,
      };
      await quizApi.createQuiz(data);
      router.push('/admin/quizzes');
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const generated = await quizApi.generateQuiz({
        topic: genTopic,
        numberOfQuestions: genCount,
        difficulty,
        preview: true,
      });
      setTitle(generated.title);
      setTitleAr(generated.titleAr || '');
      setDescription(generated.description);
      setDescriptionAr(generated.descriptionAr || '');
      setQuestions(
        generated.questions.map((q, idx) => ({
          questionText: q.questionText,
          questionTextAr: q.questionTextAr || '',
          questionType: q.questionType,
          explanation: q.explanation || '',
          explanationAr: q.explanationAr || '',
          points: q.points,
          orderInQuiz: idx,
          options: q.options.map((o, oidx) => ({
            optionText: o.optionText,
            optionTextAr: o.optionTextAr || '',
            isCorrect: o.isCorrect || false,
            orderInQuestion: oidx,
          })),
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/quizzes')}>
          <BackIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-[#0089B8]" />
            {t.quiz.createQuiz}
          </h1>
        </div>
      </div>

      {/* AI Generate */}
      <Card className="border-2 border-dashed border-[#0089B8]/30 bg-[#0089B8]/5 dark:bg-[#0089B8]/10">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-[#0089B8]">
            <Sparkles className="w-5 h-5" />
            {t.quiz.generateWithAI}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Topic (e.g., HVAC Systems)"
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              min={3}
              max={30}
              value={genCount}
              onChange={(e) => setGenCount(parseInt(e.target.value) || 5)}
              className="w-28"
              placeholder="# Questions"
            />
            <Button
              onClick={handleGenerate}
              disabled={generating || !genTopic.trim()}
              className="bg-[#0089B8] hover:bg-[#0089B8]/90"
            >
              {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
              {generating ? t.quiz.generating : t.quiz.generateWithAI}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Quiz Details */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{'Quiz Details'}</h3>
          {/* TEMPORARY: Arabic fields hidden — English only mode */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.quizTitle}</label>
              <Input value={title} onChange={(e) => { setTitle(e.target.value); setTitleAr(e.target.value); }} placeholder="Quiz title" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.quizDescription}</label>
              <Input value={description} onChange={(e) => { setDescription(e.target.value); setDescriptionAr(e.target.value); }} placeholder="Quiz description" />
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.difficulty}</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="easy">{t.quiz.easy}</option>
                <option value="medium">{t.quiz.medium}</option>
                <option value="hard">{t.quiz.hard}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.passingScore} (%)</label>
              <Input type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.timeLimit} ({'min'})</label>
              <Input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.maxAttempts}</label>
              <Input type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} placeholder={t.quiz.unlimited} />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} className="rounded" />
              {'Shuffle Questions'}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showCorrectAnswers} onChange={(e) => setShowCorrectAnswers(e.target.checked)} className="rounded" />
              {'Show Correct Answers'}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0089B8]" />
            {t.quiz.questions} ({questions.length})
          </h3>
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            {t.quiz.addQuestion}
          </Button>
        </div>

        {questions.map((q, qIdx) => (
          <Card key={qIdx} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-5 space-y-4">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline" className="text-xs">{t.quiz.question} {qIdx + 1}</Badge>
                  <select
                    value={q.questionType}
                    onChange={(e) => updateQuestion(qIdx, { questionType: e.target.value as any })}
                    className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-800"
                  >
                    <option value="multiple_choice">{'Multiple Choice'}</option>
                    <option value="true_false">{'True/False'}</option>
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(qIdx)}
                  disabled={questions.length <= 1}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* TEMPORARY: Arabic fields hidden — English only mode */}
              {/* Question Text */}
              <div className="grid grid-cols-1 gap-3">
                <Input
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value, questionTextAr: e.target.value })}
                  placeholder="Question text"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <button
                      onClick={() => setCorrectOption(qIdx, oIdx)}
                      className="shrink-0"
                      title={t.quiz.markCorrect}
                    >
                      {opt.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                      )}
                    </button>
                    {/* TEMPORARY: Arabic fields hidden — English only mode */}
                    <Input
                      value={opt.optionText}
                      onChange={(e) => updateOption(qIdx, oIdx, { optionText: e.target.value, optionTextAr: e.target.value })}
                      placeholder={`${'Option'} ${oIdx + 1}`}
                      className={cn('flex-1', opt.isCorrect && 'border-green-300 bg-green-50')}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(qIdx, oIdx)}
                      disabled={q.options.length <= 2}
                      className="shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addOption(qIdx)} className="text-[#0089B8]">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t.quiz.addOption}
                </Button>
              </div>

              {/* TEMPORARY: Arabic fields hidden — English only mode */}
              {/* Explanation */}
              <div className="grid grid-cols-1 gap-3">
                <Input
                  value={q.explanation || ''}
                  onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value, explanationAr: e.target.value })}
                  placeholder="Explanation (optional)"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" className="w-full" onClick={addQuestion}>
          <Plus className="w-4 h-4 mr-2" />
          {t.quiz.addQuestion}
        </Button>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3 pt-4 pb-16 border-t">
        <Button variant="outline" onClick={() => router.push('/admin/quizzes')}>
          {t.common.cancel}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0089B8] hover:bg-[#0089B8]/90"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          {t.common.save}
        </Button>
      </div>
    </div>
  );
}

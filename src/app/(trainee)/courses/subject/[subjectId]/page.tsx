'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLessonContext } from '@/contexts/LessonContext';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Youtube,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Brain,
  Target,
  MessageSquare,
  Phone,
  Play,
} from 'lucide-react';

interface GroupMaterial {
  id: string;
  type: 'pdf' | 'youtube';
  title: string;
  url: string;
  fileName?: string;
  fileSize?: number;
  displayOrder: number;
}

interface GroupSubject {
  id: string;
  name: string;
  order: number;
  materials: GroupMaterial[];
}

interface GroupContent {
  id: string;
  name: string;
  description: string | null;
  specialization: string | null;
  subjects: GroupSubject[];
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const { setLessonContext } = useLessonContext();
  const { token } = useAuthStore();
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<GroupSubject | null>(null);
  const [groupContent, setGroupContent] = useState<GroupContent | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<GroupMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch group content and find the subject
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const authToken = token || (() => {
          try {
            const s = localStorage.getItem('auth-storage');
            return s ? JSON.parse(s)?.state?.token : null;
          } catch { return null; }
        })();

        if (!authToken) {
          setError('Not authenticated');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/groups/my-content`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) {
          setError('Failed to load content');
          return;
        }

        const data = await response.json();
        if (!data.group) {
          setError('No group assigned');
          return;
        }

        setGroupContent(data.group);
        const foundSubject = data.group.subjects.find((s: GroupSubject) => s.id === subjectId);
        if (foundSubject) {
          setSubject(foundSubject);
          // Auto-select first YouTube video material
          const firstVideo = foundSubject.materials.find((m: GroupMaterial) => m.type === 'youtube');
          if (firstVideo) {
            setSelectedMaterial(firstVideo);
          } else if (foundSubject.materials.length > 0) {
            setSelectedMaterial(foundSubject.materials[0]);
          }
        } else {
          setError('Subject not found');
        }
      } catch {
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId, token]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get YouTube video embed URL
  const getVideoEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
    return url;
  };

  // Navigate to AI Teacher with subject context
  const handleStudyWithAI = () => {
    if (!subject || !groupContent) return;

    const materialTitles = subject.materials.map(m => m.title).join(', ');
    const firstVideo = subject.materials.find(m => m.type === 'youtube');
    const videoMatch = firstVideo?.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);

    setLessonContext({
      lessonId: subject.id,
      lessonName: subject.name,
      lessonNameAr: subject.name,
      lessonDescription: `Subject materials: ${materialTitles}`,
      lessonDescriptionAr: `Subject materials: ${materialTitles}`,
      courseId: groupContent.id,
      courseName: groupContent.name,
      courseNameAr: groupContent.name,
      courseCategory: groupContent.specialization || 'general',
      courseDifficulty: 'intermediate',
      courseObjectives: [`Learn ${subject.name}`],
      courseObjectivesAr: [`Learn ${subject.name}`],
      videoId: videoMatch ? videoMatch[1] : undefined,
      attachedFiles: subject.materials
        .filter(m => m.type === 'pdf')
        .map(m => ({
          id: m.id,
          filename: m.fileName || m.title,
          mimeType: 'application/pdf',
          url: m.url,
        })),
    });

    router.push('/ai-teacher');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subject...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !subject || !groupContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-foreground mb-2">Subject not found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/courses">
            <Button variant="outline">Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const videoMaterials = subject.materials.filter(m => m.type === 'youtube');
  const pdfMaterials = subject.materials.filter(m => m.type === 'pdf');
  const totalMaterials = subject.materials.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-4 px-4 lg:px-8">
          <Link
            href="/courses"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {groupContent.specialization && (
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {groupContent.specialization}
                  </Badge>
                )}
                <Badge variant="secondary">{groupContent.name}</Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-relaxed">
                {subject.name}
              </h1>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{totalMaterials} materials</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Youtube className="h-4 w-4" />
                <span>{videoMaterials.length} videos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>{pdfMaterials.length} documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {selectedMaterial && selectedMaterial.type === 'youtube' && (
              <Card className="overflow-hidden border-border">
                <div className="aspect-video bg-black">
                  <iframe
                    className="w-full h-full"
                    src={getVideoEmbedUrl(selectedMaterial.url)}
                    title={selectedMaterial.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2 leading-relaxed">
                    {selectedMaterial.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">YouTube Video</p>
                </CardContent>
              </Card>
            )}

            {/* PDF Viewer for selected PDF */}
            {selectedMaterial && selectedMaterial.type === 'pdf' && (
              <Card className="overflow-hidden border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground mb-1 leading-relaxed">
                        {selectedMaterial.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedMaterial.fileName || 'PDF Document'}
                        {selectedMaterial.fileSize ? ` • ${formatFileSize(selectedMaterial.fileSize)}` : ''}
                      </p>
                    </div>
                    <a
                      href={selectedMaterial.url}
                      download={selectedMaterial.fileName || 'document.pdf'}
                    >
                      <Button className="gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No materials state */}
            {!selectedMaterial && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No materials yet</h3>
                  <p className="text-muted-foreground">Materials will appear here once uploaded by your instructor.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - AI Tools & Materials List */}
          <div className="lg:col-span-1 space-y-4">
            {/* AI Learning Tools Card */}
            <Card className="border-2 border-[#0089B8]/30 bg-gradient-to-br from-[#0089B8]/5 via-[#0089B8]/5 to-[#0089B8]/5 overflow-hidden">
              <CardContent className="p-4">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-[#0089B8] to-[#006d93] rounded-xl shadow-lg shadow-[#0089B8]/25">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">AI Learning Tools</h3>
                    <p className="text-xs text-muted-foreground">Learn faster with AI assistance</p>
                  </div>
                </div>

                {/* Study with AI Teacher */}
                <div className="p-4 bg-gradient-to-br from-[#0089B8]/10 to-[#0089B8]/10 rounded-xl border border-[#0089B8]/20 mb-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0089B8]/5 to-[#0089B8]/5 animate-pulse" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5 text-[#0089B8]" />
                      <span className="font-bold text-[#0089B8]">Study with AI Teacher</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {`Get personalized explanation of "${subject.name}" with instant quizzes.`}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="secondary" className="bg-[#0089B8]/20 text-[#0089B8]/70 border-[#0089B8]/30 text-xs">
                        <Brain className="h-3 w-3 me-1" />
                        Explanations
                      </Badge>
                      <Badge variant="secondary" className="bg-[#0089B8]/20 text-[#0089B8]/70 border-[#0089B8]/30 text-xs">
                        <Target className="h-3 w-3 me-1" />
                        Quizzes
                      </Badge>
                    </div>
                    <Button
                      onClick={handleStudyWithAI}
                      className="w-full bg-gradient-to-r from-[#0089B8] to-[#006d93] hover:from-[#006d93] hover:to-[#005a7a] text-white font-semibold shadow-lg shadow-[#0089B8]/25"
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Start Studying Now
                      <Sparkles className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* AI Practice Section */}
                <div className="p-4 bg-gradient-to-br from-primary/5 to-cyan-500/5 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-semibold">Practice with AI</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    Reinforce learning with AI-powered conversations.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/voice-training" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                        <Phone className="h-4 w-4 mr-1" />
                        Voice
                      </Button>
                    </Link>
                    <Link href="/simulation" className="flex-1">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Materials List */}
            <Card className="sticky top-4 border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Materials
                </h3>
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                  {subject.materials
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((material, index) => {
                    const isSelected = selectedMaterial?.id === material.id;

                    return (
                      <button
                        key={material.id}
                        onClick={() => setSelectedMaterial(material)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-all",
                          isSelected
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted/50 border border-transparent'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            material.type === 'youtube'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-blue-500/20 text-blue-500'
                          )}>
                            {material.type === 'youtube' ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate leading-relaxed",
                              isSelected ? 'text-primary' : 'text-foreground'
                            )}>
                              {material.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {material.type === 'youtube' ? 'YouTube Video' : (
                                <>{material.fileName || 'PDF'}{material.fileSize ? ` • ${formatFileSize(material.fileSize)}` : ''}</>
                              )}
                            </p>
                          </div>
                          {material.type === 'youtube' && isSelected && (
                            <Play className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                          {material.type === 'pdf' && (
                            <a
                              href={material.url}
                              download={material.fileName || 'document.pdf'}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0"
                            >
                              <Download className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </a>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {subject.materials.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No materials uploaded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * AI Teacher Detail/Edit Page
 *
 * Comprehensive management page for a single AI teacher:
 * - Basic info editing (names, descriptions, personality, level)
 * - System prompts (AR/EN)
 * - Voice settings
 * - Documents management
 * - Assigned students list
 */

import { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import {
  aiTeachersApi,
  AITeacher,
  AITeacherStudent,
  AITeacherDocument,
  UpdateAITeacherData,
  AvailableStudent,
} from '@/lib/api/ai-teachers.api';
import { brainApi } from '@/lib/api/brain.api';
import {
  Bot,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  AlertCircle,
  Upload,
  Users,
  FileText,
  Settings,
  MessageSquare,
  Volume2,
  Trash2,
  ExternalLink,
  GraduationCap,
  Target,
  Brain,
  Star,
  Camera,
  UserPlus,
  UserMinus,
  Check,
  Search,
  ArrowRightLeft,
  Play,
  Square,
  VolumeX,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * Convert image to WebP format for smaller file size
 * Uses Canvas API to compress and convert images
 */
async function convertToWebP(file: File, maxWidth = 512, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions (max 512x512 for avatars)
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = (height / width) * maxWidth;
          width = maxWidth;
        } else {
          width = (width / height) * maxWidth;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image'));
            return;
          }

          // Create new file with WebP extension
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.webp'),
            { type: 'image/webp' }
          );

          console.log(`Image converted: ${file.size} bytes → ${webpFile.size} bytes (${Math.round((1 - webpFile.size / file.size) * 100)}% smaller)`);
          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
}

// Personality options
const PERSONALITIES = [
  { value: 'friendly', labelAr: 'ودود', labelEn: 'Friendly' },
  { value: 'challenging', labelAr: 'متحدي', labelEn: 'Challenging' },
  { value: 'professional', labelAr: 'احترافي', labelEn: 'Professional' },
  { value: 'wise', labelAr: 'حكيم', labelEn: 'Wise' },
];

// Level options
const LEVELS = [
  { value: 'beginner', labelAr: 'مبتدئ', labelEn: 'Beginner' },
  { value: 'intermediate', labelAr: 'متوسط', labelEn: 'Intermediate' },
  { value: 'advanced', labelAr: 'متقدم', labelEn: 'Advanced' },
  { value: 'professional', labelAr: 'محترف', labelEn: 'Professional' },
  { value: 'general', labelAr: 'عام', labelEn: 'General' },
];

// Context source options
const CONTEXT_SOURCES = [
  { value: 'brain', labelAr: 'قاعدة المعرفة', labelEn: 'Knowledge Base' },
  { value: 'user-history', labelAr: 'سجل المستخدم', labelEn: 'User History' },
];

// Gradient colors for teacher avatars
const GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-[#0089B8] to-[#0089B8]',
  'from-blue-500 to-blue-600',
  'from-amber-500 to-orange-500',
];

// Core teachers that cannot be deleted (the 4 default AI teachers)
const PROTECTED_TEACHER_NAMES = ['ahmed', 'noura', 'anas', 'abdullah'];

// Sara is the welcome bot - no students or documents should be assigned to her
const WELCOME_BOT_NAME = 'sara';

export default function AITeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL, language } = useLanguage();
  const { token } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<AITeacher | null>(null);
  const [students, setStudents] = useState<AITeacherStudent[]>([]);
  const [documents, setDocuments] = useState<AITeacherDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  // Form state
  const [formData, setFormData] = useState<UpdateAITeacherData>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Student management state
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<string[]>([]);
  const [selectedStudentsToUnassign, setSelectedStudentsToUnassign] = useState<string[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [studentSearchQuery, setTraineeSearchQuery] = useState('');

  // Document management state
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Avatar state (loaded separately for performance)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Voice preview state
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch teacher data (fast - without avatar)
  const fetchTeacher = useCallback(async () => {
    if (!token || !teacherId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [teacherData, studentsData, documentsData] = await Promise.all([
        aiTeachersApi.get(teacherId),
        aiTeachersApi.getStudents(teacherId),
        aiTeachersApi.getDocuments(teacherId),
      ]);

      setTeacher(teacherData.teacher);
      setStudents(studentsData.trainees);
      setDocuments(documentsData.documents);

      // Initialize form data
      setFormData({
        displayNameAr: teacherData.teacher.displayNameAr,
        displayNameEn: teacherData.teacher.displayNameEn,
        descriptionAr: teacherData.teacher.descriptionAr || '',
        descriptionEn: teacherData.teacher.descriptionEn || '',
        personality: teacherData.teacher.personality,
        level: teacherData.teacher.level,
        voiceId: teacherData.teacher.voiceId || '',
        systemPromptAr: teacherData.teacher.systemPromptAr || '',
        systemPromptEn: teacherData.teacher.systemPromptEn || '',
        welcomeMessageAr: teacherData.teacher.welcomeMessageAr || '',
        welcomeMessageEn: teacherData.teacher.welcomeMessageEn || '',
        brainQueryPrefix: teacherData.teacher.brainQueryPrefix || '',
        contextSource: teacherData.teacher.contextSource,
        isActive: teacherData.teacher.isActive,
      });

      // Load avatar in background after main data loads
      setAvatarLoading(true);
      aiTeachersApi.getAvatar(teacherId)
        .then((res) => setAvatarUrl(res.avatarUrl))
        .catch((err) => console.error('Error loading avatar:', err))
        .finally(() => setAvatarLoading(false));

    } catch (err) {
      console.error('Error fetching teacher:', err);
      setError(err instanceof Error ? err.message : 'Failed to load teacher');
    } finally {
      setIsLoading(false);
    }
  }, [token, teacherId]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  // Handle form field changes
  const handleFieldChange = (field: keyof UpdateAITeacherData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSuccessMessage(null);
  };

  // Save changes
  const handleSave = async () => {
    if (!teacher) return;

    try {
      setIsSaving(true);
      setError(null);

      const updatedTeacher = await aiTeachersApi.update(teacher.id, formData);
      setTeacher(updatedTeacher.teacher);
      setHasChanges(false);
      setSuccessMessage('Changes saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving teacher:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete teacher
  const handleDelete = async () => {
    if (!teacher) return;

    try {
      setIsDeleting(true);
      await aiTeachersApi.delete(teacher.id);
      router.push('/admin/ai-teachers');
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete teacher');
      setIsDeleting(false);
    }
  };

  // State for avatar upload
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Voice preview functions
  const handlePreviewVoice = async () => {
    const voiceId = formData.voiceId?.trim();
    if (!voiceId) {
      setError('Please enter a voice ID first');
      return;
    }

    // Stop any playing audio
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }

    setIsPreviewingVoice(true);
    setError(null);

    try {
      // Use the voiceId from formData (allows preview of unsaved changes)
      const previewText = isRTL
        ? `مرحباً! أنا ${formData.displayNameAr || teacher?.displayNameAr || 'المعلم'}. كيف يمكنني مساعدتك اليوم؟`
        : `Hello! I am ${formData.displayNameEn || teacher?.displayNameEn || 'the teacher'}. How can I help you today?`;

      // Call TTS API with voiceId directly (for previewing before save)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-teacher/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : ''}`,
        },
        body: JSON.stringify({
          text: previewText,
          language: 'en',
          voiceId: voiceId, // Send voiceId directly for preview (doesn't require save first)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load voice');
      }

      const data = await response.json();

      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        voiceAudioRef.current = audio;
        setIsPlayingVoice(true);

        audio.onended = () => {
          setIsPlayingVoice(false);
          voiceAudioRef.current = null;
        };

        audio.onerror = () => {
          setIsPlayingVoice(false);
          setError('Failed to play audio');
          voiceAudioRef.current = null;
        };

        await audio.play();
      }
    } catch (err) {
      console.error('Voice preview error:', err);
      setError(err instanceof Error ? err.message : 'Failed to preview voice');
    } finally {
      setIsPreviewingVoice(false);
    }
  };

  const handleStopVoice = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }
    setIsPlayingVoice(false);
  };

  // Handle avatar upload with WebP conversion
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !teacher) return;

    // Validate file size (10MB max for original file)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please use JPEG, PNG, or WebP.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError(null);

      // Convert image to WebP for smaller file size
      let fileToUpload = file;
      try {
        fileToUpload = await convertToWebP(file, 512, 0.85);
      } catch (conversionError) {
        console.warn('WebP conversion failed, uploading original:', conversionError);
        // Fall back to original file if conversion fails
      }

      const result = await aiTeachersApi.uploadAvatar(teacher.id, fileToUpload);
      setTeacher(result.teacher);
      // Update avatar state immediately
      if (result.teacher.avatarUrl) {
        setAvatarUrl(result.teacher.avatarUrl);
      }
      setSuccessMessage('Avatar updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(`Failed to upload avatar: ${errorMessage}`);
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle document upload for this teacher
  const handleDocumentUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !teacher) return;

    try {
      setIsUploading(true);
      setError(null);

      await brainApi.uploadDocument(file, {
        teacherId: teacher.id,
        contentLevel: teacher.level as 'beginner' | 'intermediate' | 'advanced' | 'professional' | 'general',
      });

      // Refresh documents list
      const docsData = await aiTeachersApi.getDocuments(teacher.id);
      setDocuments(docsData.documents);

      setSuccessMessage('File uploaded successfully, processing...');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (docFileInputRef.current) {
        docFileInputRef.current.value = '';
      }
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (docId: string) => {
    if (!teacher) return;
    try {
      setDeletingDocId(docId);
      await brainApi.deleteDocument(docId);
      // Refresh documents list
      const docsData = await aiTeachersApi.getDocuments(teacher.id);
      setDocuments(docsData.documents);
      setSuccessMessage('Document deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeletingDocId(null);
    }
  };

  // Fetch available students when assign dialog opens
  const fetchAvailableStudentsList = useCallback(async () => {
    if (!teacher) return;
    try {
      setIsLoadingAvailable(true);
      const data = await aiTeachersApi.getAvailableStudents(teacher.id);
      setAvailableStudents(data.trainees);
    } catch (err) {
      console.error('Error fetching available students:', err);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [teacher]);

  // Handle assign students
  const handleAssignStudents = async () => {
    if (!teacher || selectedStudentsToAssign.length === 0) return;
    try {
      setIsAssigning(true);
      await aiTeachersApi.assignStudents(teacher.id, selectedStudentsToAssign);
      // Refresh students list
      const [studentsData] = await Promise.all([
        aiTeachersApi.getStudents(teacher.id),
      ]);
      setStudents(studentsData.trainees);
      setSelectedStudentsToAssign([]);
      setShowAssignDialog(false);
      setSuccessMessage('Students assigned successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error assigning students:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign students');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle unassign students
  const handleUnassignStudents = async () => {
    if (!teacher || selectedStudentsToUnassign.length === 0) return;
    try {
      setIsAssigning(true);
      await aiTeachersApi.unassignStudents(teacher.id, selectedStudentsToUnassign);
      // Refresh students list
      const studentsData = await aiTeachersApi.getStudents(teacher.id);
      setStudents(studentsData.trainees);
      setSelectedStudentsToUnassign([]);
      setSuccessMessage('Students unassigned successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error unassigning students:', err);
      setError(err instanceof Error ? err.message : 'Failed to unassign students');
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter students by search
  const filteredAvailableStudents = availableStudents.filter(student =>
    `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  // RTL-aware arrow
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0089B8]" />
          <p className="text-sm text-muted-foreground">
            {'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !teacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={() => router.push('/admin/ai-teachers')} variant="outline">
            {'Back to List'}
          </Button>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  return (
    <div className="space-y-6 relative">
      {/* Full screen loading overlay for avatar upload */}
      {isUploadingAvatar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card border shadow-lg">
            <Loader2 className="h-10 w-10 animate-spin text-[#0089B8]" />
            <p className="text-lg font-medium">
              {'Uploading avatar...'}
            </p>
            <p className="text-sm text-muted-foreground">
              {'Please wait'}
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/ai-teachers')}
            className="shrink-0"
          >
            <BackArrow className="h-5 w-5" />
          </Button>
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer" onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}>
              <Avatar className="h-20 w-20 border-2 border-border shadow-soft">
                {/* Use avatarUrl state (lazy loaded) */}
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={teacher.displayNameEn} />
                ) : null}
                <AvatarFallback className={cn(
                  "text-white text-3xl font-bold bg-gradient-to-br",
                  avatarLoading ? "animate-pulse" : "",
                  GRADIENTS[0]
                )}>
                  {teacher.displayNameEn.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* Loading overlay during upload */}
              {isUploadingAvatar ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving || isUploadingAvatar}
              className="text-xs"
            >
              {isUploadingAvatar ? (
                <>
                  <Loader2 className={cn("h-3 w-3 animate-spin", isRTL ? "ml-1" : "mr-1")} />
                  {'Uploading...'}
                </>
              ) : (
                <>
                  <Camera className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
                  {'Change Photo'}
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {teacher.displayNameEn}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn(
                "text-xs",
                teacher.isActive
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  : "bg-gray-500/10 text-gray-500 border-gray-500/20"
              )}>
                {teacher.isActive ? ('Active') : ('Inactive')}
              </Badge>
              {teacher.isDefault && (
                <Badge variant="outline" className="text-xs bg-[#0089B8]/10 text-[#0089B8] border-[#0089B8]/20">
                  {'Default'}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Hide delete button for core teachers (ahmed, noura, anas, abdullah) */}
          {!PROTECTED_TEACHER_NAMES.includes(teacher.name.toLowerCase()) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {'Are you sure?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {teacher.isDefault
                      ? ('This is a default teacher. It will be permanently deleted. You can recreate default teachers from settings.')
                      : ('This teacher will be permanently deleted. This action cannot be undone.')
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-[#0089B8]"
          >
            {isSaving ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
            ) : (
              <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            )}
            {'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {/* Tabs */}
      {/* Sara is a welcome bot - she doesn't have students or documents tabs */}
      {(() => {
        const isWelcomeBot = teacher.name.toLowerCase() === WELCOME_BOT_NAME;
        const tabCount = isWelcomeBot ? 2 : 4;
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={cn("grid w-full max-w-xl", `grid-cols-${tabCount}`)}>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{'Info'}</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">{'Prompts'}</span>
              </TabsTrigger>
              {!isWelcomeBot && (
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{'Docs'}</span>
                  {documents.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {documents.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              {!isWelcomeBot && (
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">{'Students'}</span>
                  {students.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {students.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{'Basic Information'}</CardTitle>
              <CardDescription>
                {'Teacher name and description'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TEMPORARY: Arabic fields hidden — English only mode */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>{'Name'}</Label>
                  <Input
                    value={formData.displayNameEn || ''}
                    onChange={(e) => { handleFieldChange('displayNameEn', e.target.value); handleFieldChange('displayNameAr', e.target.value); }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>{'Description'}</Label>
                  <Textarea
                    value={formData.descriptionEn || ''}
                    onChange={(e) => { handleFieldChange('descriptionEn', e.target.value); handleFieldChange('descriptionAr', e.target.value); }}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{'Settings'}</CardTitle>
              <CardDescription>
                {'Teacher personality, level, and voice settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{'Personality'}</Label>
                  <Select
                    value={formData.personality || 'friendly'}
                    onValueChange={(value) => handleFieldChange('personality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONALITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{'Level'}</Label>
                  <Select
                    value={formData.level || 'general'}
                    onValueChange={(value) => handleFieldChange('level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{'Context Source'}</Label>
                  <Select
                    value={formData.contextSource || 'brain'}
                    onValueChange={(value) => handleFieldChange('contextSource', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTEXT_SOURCES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    {'Voice ID (ElevenLabs)'}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.voiceId || ''}
                      onChange={(e) => handleFieldChange('voiceId', e.target.value)}
                      placeholder="e.g., onwK4e9ZLuTAKqWW03F9"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={isPlayingVoice ? 'destructive' : 'outline'}
                      size="icon"
                      onClick={isPlayingVoice ? handleStopVoice : handlePreviewVoice}
                      disabled={isPreviewingVoice || !formData.voiceId?.trim()}
                      title={isPlayingVoice ? 'Stop' : 'Preview Voice'}
                    >
                      {isPreviewingVoice ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isPlayingVoice ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {'Click play to hear a voice preview'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{'Brain Query Prefix'}</Label>
                  <Input
                    value={formData.brainQueryPrefix || ''}
                    onChange={(e) => handleFieldChange('brainQueryPrefix', e.target.value)}
                    placeholder="e.g., basics fundamentals beginner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label className="text-base">{'Status'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {'Enable or disable this teacher'}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{'System Prompts'}</CardTitle>
              <CardDescription>
                {'Core instructions for the AI teacher. Use {{PROFILE}} and {{CONTEXT}} for variables.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TEMPORARY: Arabic fields hidden — English only mode */}
              <div className="space-y-2">
                <Label>{'System Prompt'}</Label>
                <Textarea
                  value={formData.systemPromptEn || ''}
                  onChange={(e) => { handleFieldChange('systemPromptEn', e.target.value); handleFieldChange('systemPromptAr', e.target.value); }}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Enter system prompt..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{'Welcome Messages'}</CardTitle>
              <CardDescription>
                {'The message shown when starting a conversation with this teacher'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TEMPORARY: Arabic fields hidden — English only mode */}
              <div className="space-y-2">
                <Label>{'Welcome Message'}</Label>
                <Textarea
                  value={formData.welcomeMessageEn || ''}
                  onChange={(e) => { handleFieldChange('welcomeMessageEn', e.target.value); handleFieldChange('welcomeMessageAr', e.target.value); }}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{'Linked Documents'}</CardTitle>
                  <CardDescription>
                    {'Documents assigned to this teacher from the knowledge base'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => docFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-[#0089B8]"
                  >
                    {isUploading ? (
                      <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                    ) : (
                      <Upload className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    )}
                    {'Upload File'}
                  </Button>
                  <Link href="/admin/brain">
                    <Button variant="outline" size="sm">
                      <FileText className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {'Manage All'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{'No documents linked to this teacher'}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => docFileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {'Upload New File'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0089B8]/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-[#0089B8]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.fileName} • {doc.chunkCount} chunks
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          doc.status === 'ready' ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {doc.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={deletingDocId === doc.id}
                        >
                          {deletingDocId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{'Assigned Students'}</CardTitle>
                <CardDescription>
                  {'List of students who have been assigned this teacher'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedStudentsToUnassign.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnassignStudents}
                    disabled={isAssigning}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    {isAssigning ? (
                      <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                    ) : (
                      <UserMinus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    )}
                    {`Unassign (${selectedStudentsToUnassign.length})`}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAssignDialog(true);
                    fetchAvailableStudentsList();
                  }}
                >
                  <UserPlus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {'Add Students'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{'No students assigned to this teacher'}</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setShowAssignDialog(true);
                      fetchAvailableStudentsList();
                    }}
                    className="mt-2"
                  >
                    <UserPlus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {'Add students now'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedStudentsToUnassign.includes(student.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudentsToUnassign(prev => [...prev, student.id]);
                            } else {
                              setSelectedStudentsToUnassign(prev => prev.filter(id => id !== student.id));
                            }
                          }}
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.currentSkillLevel && (
                          <Badge variant="outline" className="text-xs">
                            {student.currentSkillLevel}
                          </Badge>
                        )}
                        <Link href={`/admin/employees/${student.id}`}>
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assign Students Dialog */}
        <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <AlertDialogContent className="sm:max-w-[600px] max-h-[80vh]">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#0089B8]" />
                {'Add Students to Teacher'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {'Select students to assign to this teacher. Students assigned to another teacher will be transferred.'}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder="Search for student..."
                  value={studentSearchQuery}
                  onChange={(e) => setTraineeSearchQuery(e.target.value)}
                  className={isRTL ? "pr-10" : "pl-10"}
                />
              </div>

              {/* Students List */}
              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                {isLoadingAvailable ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0089B8]" />
                  </div>
                ) : filteredAvailableStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {studentSearchQuery
                        ? ('No results found')
                        : ('All students are assigned to this teacher')}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredAvailableStudents.map((student) => (
                      <div
                        key={student.id}
                        className={cn(
                          "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                          selectedStudentsToAssign.includes(student.id)
                            ? "bg-[#0089B8]/10"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => {
                          if (selectedStudentsToAssign.includes(student.id)) {
                            setSelectedStudentsToAssign(prev => prev.filter(id => id !== student.id));
                          } else {
                            setSelectedStudentsToAssign(prev => [...prev, student.id]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={selectedStudentsToAssign.includes(student.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudentsToAssign(prev => [...prev, student.id]);
                            } else {
                              setSelectedStudentsToAssign(prev => prev.filter(id => id !== student.id));
                            }
                          }}
                        />
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                        </div>
                        {student.currentTeacherName && (
                          <Badge variant="outline" className="text-xs shrink-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                            <ArrowRightLeft className="h-3 w-3 mr-1" />
                            {student.currentTeacherName.en}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedStudentsToAssign.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {`${selectedStudentsToAssign.length} student(s) selected`}
                </p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSelectedStudentsToAssign([]);
                setTraineeSearchQuery('');
              }}>
                {'Cancel'}
              </AlertDialogCancel>
              <Button
                onClick={handleAssignStudents}
                disabled={selectedStudentsToAssign.length === 0 || isAssigning}
                className="bg-[#0089B8]"
              >
                {isAssigning ? (
                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                ) : (
                  <Check className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                )}
                {'Assign Students'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
          </Tabs>
        );
      })()}
    </div>
  );
}

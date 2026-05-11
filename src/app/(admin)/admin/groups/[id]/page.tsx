'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import {
  UsersRound,
  ArrowLeft,
  ArrowRight,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Loader2,
  UserPlus,
  UserMinus,
  Edit,
  Save,
  X,
  BookOpen,
  Search,
  Clock,
  Play,
  Bot,
} from 'lucide-react';

interface Supervisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Member {
  id: string;
  trainee: {  // Backend field name (kept for API compatibility)
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  joinedAt: string;
  isActive: boolean;
}

interface SupervisorAssignment {
  id: string;
  trainer: Supervisor;  // Backend field name (kept for API compatibility)
  assignedAt: string;
  isActive: boolean;
}

interface GroupCourseItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  category: string;
  difficulty: string;
  thumbnailUrl?: string;
  estimatedDurationMinutes: number;
  _count?: { lectures: number };
  lessonCount?: number;
  order: number;
}

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  specialization?: string | null;
  maxStudents?: number | null;
  isActive: boolean;
  createdAt: string;
  members: Member[];
  trainerAssignments: SupervisorAssignment[];
  courses?: { course: GroupCourseItem }[];
  aiTeacherAssignments?: {
    id: string;
    aiTeacher: AITeacherItem;
    assignedAt: string;
  }[];
  _count: {
    members: number;
    trainerAssignments: number;
  };
}

interface AvailableCourse {
  id: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn: string;
  category: string;
  difficulty: string;
  thumbnailUrl?: string;
  estimatedDurationMinutes: number;
  _count?: { lectures: number; attachments: number };
}

interface AvailableStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  groupCount: number;
}

interface AvailableSupervisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  groupCount: number;
}

interface AITeacherItem {
  id: string;
  name: string;
  displayNameAr: string;
  displayNameEn: string;
  avatarUrl: string | null;
  personality: string;
  level: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { isRTL } = useLanguage();
  const groupId = params.id as string;

  // Check if user is admin - supervisors should not be able to add/remove
  const isAdmin = user?.role === 'admin' || user?.role === 'saas_super_admin';

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Add member dialog
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [availableStudents, setAvailableTrainees] = useState<AvailableStudent[]>([]);
  const [selectedStudents, setSelectedTrainees] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // Course assignment
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isAssigningCourses, setIsAssigningCourses] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Add supervisor dialog
  const [isAddSupervisorOpen, setIsAddTrainerOpen] = useState(false);
  const [availableSupervisors, setAvailableTrainers] = useState<AvailableSupervisor[]>([]);
  const [selectedSupervisor, setSelectedTrainer] = useState<string>('');
  const [isAssigningSupervisor, setIsAssigningTrainer] = useState(false);

  // Add AI teacher dialog
  const [isAddAITeacherOpen, setIsAddAITeacherOpen] = useState(false);
  const [availableAITeachers, setAvailableAITeachers] = useState<AITeacherItem[]>([]);
  const [selectedAITeacher, setSelectedAITeacher] = useState<string>('');
  const [isAssigningAITeacher, setIsAssigningAITeacher] = useState(false);

  const getAuthToken = useCallback((): string | null => {
    if (token) return token;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.token || null;
      }
    } catch (e) {
      console.error('Failed to parse auth-storage:', e);
    }
    return null;
  }, [token]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchGroup = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
        setEditName(data.group.name);
        setEditDescription(data.group.description || '');
      } else if (response.status === 404) {
        router.push('/admin/groups');
      }
    } catch (err) {
      console.error('Error fetching group:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, apiUrl, groupId, router]);

  const fetchAvailableStudents = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const response = await fetch(`${apiUrl}/groups/available-trainees`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTrainees(data.trainees || []);
      }
    } catch (err) {
      console.error('Error fetching available students:', err);
    }
  };

  const fetchAvailableSupervisors = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const response = await fetch(`${apiUrl}/groups/available-trainers`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTrainers(data.trainers || []);
      }
    } catch (err) {
      console.error('Error fetching available supervisors:', err);
    }
  };

  const fetchAvailableAITeachers = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const response = await fetch(`${apiUrl}/groups/available-ai-teachers`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableAITeachers(data.aiTeachers || []);
      }
    } catch (err) {
      console.error('Error fetching AI teachers:', err);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleSaveEdit = async () => {
    const authToken = getAuthToken();
    if (!authToken || !editName.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update group');
      }
    } catch (err) {
      console.error('Error updating group:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMembers = async () => {
    const authToken = getAuthToken();
    if (!authToken || selectedStudents.length === 0) return;

    setIsAddingMembers(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ traineeIds: selectedStudents }),
      });

      if (response.ok) {
        setIsAddMemberOpen(false);
        setSelectedTrainees([]);
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add members');
      }
    } catch (err) {
      console.error('Error adding members:', err);
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMember = async (traineeId: string) => {
    const authToken = getAuthToken();
    if (!authToken) return;

    if (!confirm('Are you sure you want to remove this student?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/members/${traineeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove member');
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const handleAssignSupervisor = async () => {
    const authToken = getAuthToken();
    if (!authToken || !selectedSupervisor) return;

    setIsAssigningTrainer(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/trainers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainerId: selectedSupervisor }),
      });

      if (response.ok) {
        setIsAddTrainerOpen(false);
        setSelectedTrainer('');
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign supervisor');
      }
    } catch (err) {
      console.error('Error assigning supervisor:', err);
    } finally {
      setIsAssigningTrainer(false);
    }
  };

  const handleUnassignSupervisor = async (trainerId: string) => {
    const authToken = getAuthToken();
    if (!authToken) return;

    if (!confirm('Are you sure you want to unassign this supervisor?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/trainers/${trainerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unassign supervisor');
      }
    } catch (err) {
      console.error('Error unassigning supervisor:', err);
    }
  };

  const handleAssignAITeacher = async () => {
    const authToken = getAuthToken();
    if (!authToken || !selectedAITeacher) return;

    setIsAssigningAITeacher(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/ai-teachers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aiTeacherId: selectedAITeacher }),
      });

      if (response.ok) {
        setIsAddAITeacherOpen(false);
        setSelectedAITeacher('');
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign AI teacher');
      }
    } catch (err) {
      console.error('Error assigning AI teacher:', err);
    } finally {
      setIsAssigningAITeacher(false);
    }
  };

  const handleUnassignAITeacher = async (aiTeacherId: string) => {
    const authToken = getAuthToken();
    if (!authToken) return;

    if (!confirm('Are you sure you want to unassign this AI teacher?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/ai-teachers/${aiTeacherId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unassign AI teacher');
      }
    } catch (err) {
      console.error('Error unassigning AI teacher:', err);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0089B8]" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{'Group not found'}</p>
        <Link href="/admin/groups">
          <Button variant="link" className="mt-2">
            {'Back to Groups'}
          </Button>
        </Link>
      </div>
    );
  }

  // ========== Course Assignment Handlers ==========
  const fetchAvailableCourses = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;
    try {
      const response = await fetch(`${apiUrl}/admin/courses`, {
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleAssignCourses = async () => {
    const authToken = getAuthToken();
    if (!authToken || selectedCourseIds.length === 0) return;
    setIsAssigningCourses(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/courses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: selectedCourseIds }),
      });
      if (response.ok) {
        setIsAddCourseOpen(false);
        setSelectedCourseIds([]);
        setCourseSearchQuery('');
        fetchGroup();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to assign courses');
      }
    } catch { alert('Failed to assign courses'); }
    finally { setIsAssigningCourses(false); }
  };

  const handleUnassignCourse = async (courseId: string) => {
    if (!confirm('Remove this course from the group?')) return;
    const authToken = getAuthToken();
    if (!authToken) return;
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        fetchGroup();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to remove course');
      }
    } catch { alert('Failed to remove course'); }
  };

  const activeMembers = group.members.filter((m) => m.isActive);
  const activeSupervisors = group.trainerAssignments.filter((t) => t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/groups">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <BackIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-bold max-w-xs"
              />
              <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
              {isAdmin && (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {!group.isActive && (
                <Badge variant="outline">{'Inactive'}</Badge>
              )}
            </div>
          )}
          {isEditing ? (
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder={'Group description'}
              className="mt-2 max-w-lg"
            />
          ) : (
            <p className="text-muted-foreground mt-1">
              {group.description || ('No description')}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeMembers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {'Students'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeSupervisors.length}</p>
                <p className="text-xs text-muted-foreground">
                  {'Supervisors'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialization Info */}
      {group.specialization && (
        <Card className="border-border bg-gradient-to-br from-[#0089B8]/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#0089B8]/20">
                <BookOpen className="h-5 w-5 text-[#0089B8]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Specialization</p>
                <p className="text-lg font-semibold text-foreground">{group.specialization}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Courses Section */}
      {isAdmin && (
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#0089B8]" />
                Learning Courses
              </CardTitle>
              <CardDescription>
                {group.courses?.length || 0} courses assigned
              </CardDescription>
            </div>
            <Dialog
              open={isAddCourseOpen}
              onOpenChange={(open) => {
                setIsAddCourseOpen(open);
                if (open) fetchAvailableCourses();
                if (!open) { setSelectedCourseIds([]); setCourseSearchQuery(''); }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Courses
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Courses to Group</DialogTitle>
                  <DialogDescription>
                    Select courses to assign to this group. Students in this group will see these courses.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <Input
                    placeholder="Search courses..."
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className="mb-3"
                  />
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                    {availableCourses
                      .filter((c) => !group.courses?.some((gc) => gc.course.id === c.id))
                      .filter((c) => !courseSearchQuery || c.titleEn?.toLowerCase().includes(courseSearchQuery.toLowerCase()) || c.titleAr?.toLowerCase().includes(courseSearchQuery.toLowerCase()) || c.category?.toLowerCase().includes(courseSearchQuery.toLowerCase()))
                      .map((course) => {
                        const lectureCount = course._count?.lectures || 0;
                        const isSelected = selectedCourseIds.includes(course.id);
                        return (
                          <label
                            key={course.id}
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border transition-colors",
                              isSelected
                                ? "border-[#0089B8] bg-[#0089B8]/10"
                                : "border-transparent hover:bg-muted"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCourseIds([...selectedCourseIds, course.id]);
                                } else {
                                  setSelectedCourseIds(selectedCourseIds.filter((id) => id !== course.id));
                                }
                              }}
                              className="rounded shrink-0 mt-1"
                            />
                            {course.thumbnailUrl ? (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.titleEn}
                                className="w-20 h-14 rounded-md object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-20 h-14 rounded-md bg-[#0089B8]/20 flex items-center justify-center shrink-0">
                                <BookOpen className="h-6 w-6 text-[#0089B8]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{course.titleEn}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{course.descriptionEn}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{course.category?.replace('_', ' ')}</Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{course.difficulty}</Badge>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Play className="h-3 w-3" /> {lectureCount} lectures
                                </span>
                                {course.estimatedDurationMinutes > 0 && (
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {Math.floor(course.estimatedDurationMinutes / 60)}h {course.estimatedDurationMinutes % 60}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    {availableCourses.filter((c) => !group.courses?.some((gc) => gc.course.id === c.id)).length === 0 && (
                      <p className="text-center py-6 text-muted-foreground text-sm">
                        {availableCourses.length === 0 ? (
                          <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading courses...</span>
                        ) : 'All courses already assigned'}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleAssignCourses}
                    disabled={selectedCourseIds.length === 0 || isAssigningCourses}
                    className="bg-[#0089B8] hover:bg-[#0089B8]/90"
                  >
                    {isAssigningCourses ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Add (${selectedCourseIds.length})`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {group.courses && group.courses.length > 0 ? (
              <div className="space-y-2">
                {group.courses.map((gc) => (
                  <div
                    key={gc.course.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {gc.course.thumbnailUrl ? (
                        <img
                          src={gc.course.thumbnailUrl}
                          alt={gc.course.titleEn}
                          className="w-16 h-11 rounded-md object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-11 rounded-md bg-[#0089B8]/20 flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5 text-[#0089B8]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{gc.course.titleEn}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{gc.course.category?.replace('_', ' ')}</Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{gc.course.difficulty}</Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Play className="h-3 w-3" /> {gc.course._count?.lectures || gc.course.lessonCount || 0} lectures
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleUnassignCourse(gc.course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No courses assigned yet. Add courses for group students to see.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Teacher Section (single teacher per group) */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Bot className="h-5 w-5 text-violet-500" />
              {'AI Teacher'}
            </CardTitle>
            <CardDescription>
              {group.aiTeacherAssignments?.length ? 'AI teacher assigned' : 'No AI teacher assigned'}
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog
              open={isAddAITeacherOpen}
              onOpenChange={(open) => {
                setIsAddAITeacherOpen(open);
                if (open) fetchAvailableAITeachers();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {group.aiTeacherAssignments?.length ? 'Change AI Teacher' : 'Assign AI Teacher'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{group.aiTeacherAssignments?.length ? 'Change AI Teacher' : 'Assign AI Teacher'}</DialogTitle>
                  <DialogDescription>
                    {group.aiTeacherAssignments?.length
                      ? 'Select a new AI teacher to replace the current one'
                      : 'Select an AI teacher to assign to this group'}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select value={selectedAITeacher} onValueChange={setSelectedAITeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder={'Select AI teacher'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAITeachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.displayNameEn} - {teacher.personality} ({teacher.level})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddAITeacherOpen(false)}>
                    {'Cancel'}
                  </Button>
                  <Button
                    onClick={handleAssignAITeacher}
                    disabled={!selectedAITeacher || isAssigningAITeacher}
                    className="bg-[#0089B8] hover:bg-[#0089B8]/90"
                  >
                    {isAssigningAITeacher ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      group.aiTeacherAssignments?.length ? 'Change' : 'Assign'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {group.aiTeacherAssignments && group.aiTeacherAssignments.length > 0 ? (
            (() => {
              const assignment = group.aiTeacherAssignments[0];
              return (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {assignment.aiTeacher.avatarUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={assignment.aiTeacher.avatarUrl}
                          alt={assignment.aiTeacher.displayNameEn}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          unoptimized={assignment.aiTeacher.avatarUrl.startsWith('data:')}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center text-white font-medium text-lg">
                        {assignment.aiTeacher.displayNameEn[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground text-base">
                        {assignment.aiTeacher.displayNameEn}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {assignment.aiTeacher.personality}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {assignment.aiTeacher.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleUnassignAITeacher(assignment.aiTeacher.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })()
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {'No AI teacher assigned to this group'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trainers Section */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">
              {'Assigned Supervisors'}
            </CardTitle>
            <CardDescription>
              {activeSupervisors.length} {'supervisors assigned'}
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog
              open={isAddSupervisorOpen}
              onOpenChange={(open) => {
                setIsAddTrainerOpen(open);
                if (open) fetchAvailableSupervisors();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {'Assign Supervisor'}
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{'Assign Supervisor'}</DialogTitle>
                <DialogDescription>
                  {'Select a supervisor to assign to this group'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={selectedSupervisor} onValueChange={setSelectedTrainer}>
                  <SelectTrigger>
                    <SelectValue placeholder={'Select supervisor'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSupervisors
                      .filter((t) => !activeSupervisors.some((at) => at.trainer.id === t.id))
                      .map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.id}>
                          {trainer.firstName} {trainer.lastName} ({trainer.groupCount} {'groups'})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTrainerOpen(false)}>
                  {'Cancel'}
                </Button>
                <Button
                  onClick={handleAssignSupervisor}
                  disabled={!selectedSupervisor || isAssigningSupervisor}
                  className="bg-[#0089B8] hover:bg-[#0089B8]/90"
                >
                  {isAssigningSupervisor ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Assign'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {activeSupervisors.length > 0 ? (
            <div className="space-y-2">
              {activeSupervisors.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {assignment.trainer.firstName[0]}
                      {assignment.trainer.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {assignment.trainer.firstName} {assignment.trainer.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{assignment.trainer.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleUnassignSupervisor(assignment.trainer.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {'No supervisors assigned yet'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">
              {'Group Members'}
            </CardTitle>
            <CardDescription>
              {activeMembers.length} {'students'}
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog
              open={isAddMemberOpen}
              onOpenChange={(open) => {
                setIsAddMemberOpen(open);
                if (open) fetchAvailableStudents();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  {'Add Students'}
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{'Add Students'}</DialogTitle>
                <DialogDescription>
                  {'Select students to add to this group'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[300px] overflow-y-auto">
                {availableStudents
                  .filter((t) => !activeMembers.some((m) => m.trainee.id === t.id))
                  .map((trainee) => (
                    <label
                      key={trainee.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(trainee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTrainees([...selectedStudents, trainee.id]);
                          } else {
                            setSelectedTrainees(selectedStudents.filter((id) => id !== trainee.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium">
                          {trainee.firstName} {trainee.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{trainee.email}</p>
                      </div>
                    </label>
                  ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                  {'Cancel'}
                </Button>
                <Button
                  onClick={handleAddMembers}
                  disabled={selectedStudents.length === 0 || isAddingMembers}
                  className="bg-[#0089B8] hover:bg-[#0089B8]/90"
                >
                  {isAddingMembers ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Add (${selectedStudents.length})`
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {activeMembers.length > 0 ? (
            <div className="space-y-2">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0089B8] flex items-center justify-center text-white font-medium">
                      {member.trainee.firstName[0]}
                      {member.trainee.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.trainee.firstName} {member.trainee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.trainee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/trainee/${member.trainee.id}/reports`}>
                      <Button variant="outline" size="sm">
                        {'Reports'}
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveMember(member.trainee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {'No students in this group yet'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

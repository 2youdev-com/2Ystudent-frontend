'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRoleSafe } from '@/contexts/AdminRoleContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  UsersRound,
  Plus,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Users,
  GraduationCap,
  Loader2,
  Trash2,
  Edit,
  BookOpen,
  X,
  Clock,
  Play,
} from 'lucide-react';

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

interface Supervisor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  memberCount: number;
  trainerCount: number;
  trainers: Supervisor[];  // Backend field name (kept for API compatibility)
}

export default function GroupsPage() {
  const { token } = useAuthStore();
  const { isRTL } = useLanguage();
  const { isSupervisor, isAdmin, permissions } = useAdminRoleSafe();
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupSpecialization, setNewGroupSpecialization] = useState('');
  const [newGroupMaxStudents, setNewGroupMaxStudents] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Supervisors cannot create or delete groups
  const canCreateGroups = permissions?.canCreateGroups ?? isAdmin;
  const canDeleteGroups = permissions?.canDeleteGroups ?? isAdmin;

  // Helper to get token
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

  const fetchGroups = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      // Use /admin/groups endpoint which filters for trainers automatically
      const response = await fetch(`${apiUrl}/admin/groups`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const fetchAvailableCourses = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    setIsCreating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      // Step 1: Create the group
      const response = await fetch(`${apiUrl}/groups`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          specialization: newGroupSpecialization.trim() || null,
          maxStudents: newGroupMaxStudents ? parseInt(newGroupMaxStudents) : null,
        }),
      });

      if (response.ok) {
        const createdGroup = await response.json();
        // Step 2: Assign selected courses to the new group
        if (selectedCourseIds.length > 0 && createdGroup.id) {
          await fetch(`${apiUrl}/groups/${createdGroup.id}/courses`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseIds: selectedCourseIds }),
          });
        }
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupSpecialization('');
        setNewGroupMaxStudents('');
        setSelectedCourseIds([]);
        setCourseSearchQuery('');
        setIsCreateDialogOpen(false);
        fetchGroups();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupId) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    setIsDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/groups/${deleteGroupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setDeleteGroupId(null);
        fetchGroups();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete group');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isSupervisor && <UsersRound className="h-6 w-6 text-[#0089B8]" />}
            {isSupervisor ? 'My Groups' : 'Groups'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSupervisor
              ? 'Groups assigned to you and their students'
              : 'Manage student groups and supervisor assignments'}
          </p>
        </div>
        <div className="flex gap-2">
          {isSupervisor && (
            <Badge variant="outline" className="px-3 py-1.5 bg-[#0089B8]/10 border-[#0089B8]/30 text-[#0089B8]">
              {'Supervisor View'}
            </Badge>
          )}
          <Button variant="outline" onClick={fetchGroups} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {'Refresh'}
          </Button>
          {canCreateGroups && (
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (open) fetchAvailableCourses();
              if (!open) { setSelectedCourseIds([]); setCourseSearchQuery(''); }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#0089B8] hover:bg-[#0089B8]/90">
                  <Plus className="h-4 w-4" />
                  {'New Group'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{'Create New Group'}</DialogTitle>
                  <DialogDescription>
                    {'Set up a new group and assign learning courses'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Group Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {'Group Name'} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder={'e.g., Section A - Fall 2024'}
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {'Description'}
                    </label>
                    <Input
                      placeholder={'Group description'}
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                    />
                  </div>

                  {/* Specialization */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {'Specialization Name'}
                    </label>
                    <Input
                      placeholder={'e.g., Computer Science, Electrical Engineering'}
                      value={newGroupSpecialization}
                      onChange={(e) => setNewGroupSpecialization(e.target.value)}
                    />
                  </div>

                  {/* Number of Students */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {'Number of Students'}
                    </label>
                    <Input
                      type="number"
                      placeholder={'e.g., 30'}
                      value={newGroupMaxStudents}
                      onChange={(e) => setNewGroupMaxStudents(e.target.value)}
                      min="1"
                    />
                  </div>

                  {/* Courses */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#0089B8]" />
                      Assign Courses
                      {selectedCourseIds.length > 0 && (
                        <Badge className="bg-[#0089B8] text-white text-[10px] px-1.5 py-0">{selectedCourseIds.length} selected</Badge>
                      )}
                    </label>
                    <Input
                      placeholder="Search courses..."
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                    />
                    <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
                      {availableCourses.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground text-sm flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading courses...
                        </p>
                      ) : (
                        availableCourses
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
                                  className="rounded shrink-0"
                                />
                                {course.thumbnailUrl ? (
                                  <img src={course.thumbnailUrl} alt="" className="w-16 h-11 rounded-md object-cover shrink-0" />
                                ) : (
                                  <div className="w-16 h-11 rounded-md bg-[#0089B8]/20 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5 text-[#0089B8]" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{course.titleEn}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{course.category?.replace('_', ' ')}</Badge>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{course.difficulty}</Badge>
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                      <Play className="h-3 w-3" /> {lectureCount}
                                    </span>
                                  </div>
                                </div>
                              </label>
                            );
                          })
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select courses that students in this group will see. You can add more later.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {'Cancel'}
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || isCreating}
                    className="bg-[#0089B8] hover:bg-[#0089B8]/90"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {'Creating...'}
                      </>
                    ) : (
                      'Create Group'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground',
                isRTL ? 'right-3' : 'left-3'
              )}
            />
            <Input
              placeholder={'Search groups...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(isRTL ? 'pr-10' : 'pl-10')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn(
          "border-border bg-gradient-to-br to-transparent",
          isSupervisor ? "from-[#0089B8]/10" : "from-[#0089B8]/10"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                isSupervisor ? "bg-[#0089B8]/20" : "bg-[#0089B8]/20"
              )}>
                <UsersRound className={cn("h-5 w-5", isSupervisor ? "text-[#0089B8]" : "text-[#0089B8]")} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{groups.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isSupervisor ? 'My Groups' : 'Total Groups'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-border bg-gradient-to-br to-transparent",
          isSupervisor ? "from-[#0089B8]/10" : "from-blue-500/10"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                isSupervisor ? "bg-[#0089B8]/20" : "bg-blue-500/20"
              )}>
                <Users className={cn("h-5 w-5", isSupervisor ? "text-[#0089B8]" : "text-blue-500")} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {groups.reduce((acc, g) => acc + g.memberCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSupervisor ? 'My Students' : 'Total Students'}
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
                <p className="text-2xl font-bold text-foreground">
                  {new Set(groups.flatMap((g) => g.trainers.map((t) => t.id))).size}
                </p>
                <p className="text-xs text-muted-foreground">
                  {'Assigned Supervisors'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            {isSupervisor ? 'Groups Assigned to Me' : 'All Groups'}
          </CardTitle>
          <CardDescription>
            {filteredGroups.length} {'groups found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className="space-y-3">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white",
                      isSupervisor
                        ? "bg-[#0089B8]"
                        : "bg-[#0089B8]"
                    )}>
                      <UsersRound className="h-6 w-6" />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{group.name}</p>
                        {!group.isActive && (
                          <Badge variant="outline" className="text-xs">
                            {'Inactive'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {group.description || ('No description')}
                      </p>
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center gap-6">
                    <div className="text-center hidden md:block">
                      <p className="text-sm font-semibold text-foreground">{group.memberCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {'Students'}
                      </p>
                    </div>

                    <div className="text-center hidden md:block">
                      <p className="text-sm font-semibold text-foreground">{group.trainers.length}</p>
                      <p className="text-xs text-muted-foreground">
                        {'Supervisors'}
                      </p>
                    </div>

                    {group.trainers.length > 0 && (
                      <div className="hidden lg:flex -space-x-2">
                        {group.trainers.slice(0, 3).map((trainer) => (
                          <div
                            key={trainer.id}
                            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-background"
                            title={`${trainer.firstName} ${trainer.lastName}`}
                          >
                            {trainer.firstName[0]}
                            {trainer.lastName[0]}
                          </div>
                        ))}
                        {group.trainers.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                            +{group.trainers.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/admin/groups/${group.id}`}>
                        <Button variant="outline" size="sm">
                          {isSupervisor ? 'View' : 'Manage'}
                        </Button>
                      </Link>
                      {canDeleteGroups && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteGroupId(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UsersRound className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No groups found'
                  : isSupervisor
                    ? 'No groups assigned to you yet'
                    : 'No groups yet'}
              </p>
              {!searchTerm && canCreateGroups && (
                <Button
                  variant="link"
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-2 text-[#0089B8]"
                >
                  {'Create your first group'}
                </Button>
              )}
              {!searchTerm && isSupervisor && (
                <p className="text-sm text-muted-foreground mt-2">
                  {'Contact your organization admin to be assigned to a group'}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteGroupId} onOpenChange={(open) => { if (!open) setDeleteGroupId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{groups.find(g => g.id === deleteGroupId)?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteGroupId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGroup}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

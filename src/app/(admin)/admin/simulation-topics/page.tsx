'use client';

/**
 * Admin Simulation Topics Management Page
 *
 * Allows org admins to manage simulation training topics:
 * - View all topics in a grid
 * - Create new topics
 * - Edit topic details, prompts, linked courses
 * - Delete topics
 * - Seed default topics
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Loader2,
  MessageSquare,
  BookOpen,
  Search,
  Sparkles,
  Link,
  AlertCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SimulationTopic {
  id: string;
  title: string;
  description: string | null;
  scenarioType: string;
  systemPrompt: string | null;
  courseId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    titleEn: string;
    titleAr?: string;
  } | null;
}

interface AvailableCourse {
  id: string;
  titleEn: string;
  titleAr?: string;
}

interface TopicFormData {
  title: string;
  description: string;
  scenarioType: string;
  systemPrompt: string;
  courseId: string;
  isActive: boolean;
  sortOrder: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SCENARIO_TYPES = [
  { value: 'hvac_systems', label: 'HVAC Systems' },
  { value: 'electrical_systems', label: 'Electrical Systems' },
  { value: 'safety_compliance', label: 'Safety Compliance' },
  { value: 'plc_automation', label: 'PLC Automation' },
  { value: 'industrial_maintenance', label: 'Industrial Maintenance' },
  { value: 'advanced_troubleshooting', label: 'Advanced Troubleshooting' },
  { value: 'motor_controls', label: 'Motor Controls' },
  { value: 'bms_systems', label: 'BMS Systems' },
] as const;

const SCENARIO_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  SCENARIO_TYPES.map((t) => [t.value, t.label])
);

const SCENARIO_TYPE_COLORS: Record<string, string> = {
  hvac_systems: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  electrical_systems: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  safety_compliance: 'bg-red-500/10 text-red-500 border-red-500/20',
  plc_automation: 'bg-[#0089B8]/10 text-[#0089B8] border-[#0089B8]/20',
  industrial_maintenance: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  advanced_troubleshooting: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  motor_controls: 'bg-green-500/10 text-green-500 border-green-500/20',
  bms_systems: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

const DEFAULT_FORM_DATA: TopicFormData = {
  title: '',
  description: '',
  scenarioType: 'hvac_systems',
  systemPrompt: '',
  courseId: '',
  isActive: true,
  sortOrder: 0,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SimulationTopicsPage() {
  // State
  const [topics, setTopics] = useState<SimulationTopic[]>([]);
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<SimulationTopic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<SimulationTopic | null>(null);
  const [formData, setFormData] = useState<TopicFormData>(DEFAULT_FORM_DATA);

  // Action state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // ─── Auth ────────────────────────────────────────────────────────────────

  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const directToken = localStorage.getItem('auth_token');
      if (directToken) return directToken;
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.token || null;
      }
    } catch (e) {
      return null;
    }
    return null;
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchTopics = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/simulation-topics`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || 'Failed to load topics');
      }
    } catch (err) {
      console.error('Error fetching simulation topics:', err);
      setError('Failed to load simulation topics');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, apiUrl]);

  const fetchCourses = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const response = await fetch(`${apiUrl}/admin/courses`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, [getAuthToken, apiUrl]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const openCreateDialog = () => {
    setEditingTopic(null);
    setFormData(DEFAULT_FORM_DATA);
    fetchCourses();
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (topic: SimulationTopic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description || '',
      scenarioType: topic.scenarioType,
      systemPrompt: topic.systemPrompt || '',
      courseId: topic.courseId || '',
      isActive: topic.isActive,
      sortOrder: topic.sortOrder,
    });
    fetchCourses();
    setIsFormDialogOpen(true);
  };

  const openDeleteDialog = (topic: SimulationTopic) => {
    setDeletingTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        scenarioType: formData.scenarioType,
        systemPrompt: formData.systemPrompt.trim() || null,
        courseId: formData.courseId || null,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      const isEditing = !!editingTopic;
      const url = isEditing
        ? `${apiUrl}/simulation-topics/${editingTopic.id}`
        : `${apiUrl}/simulation-topics`;

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsFormDialogOpen(false);
        setEditingTopic(null);
        setFormData(DEFAULT_FORM_DATA);
        fetchTopics();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || `Failed to ${isEditing ? 'update' : 'create'} topic`);
      }
    } catch (err) {
      console.error('Error saving topic:', err);
      alert('Failed to save topic');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTopic) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${apiUrl}/simulation-topics/${deletingTopic.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setDeletingTopic(null);
        fetchTopics();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || 'Failed to delete topic');
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('Failed to delete topic');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedDefaults = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    setIsSeeding(true);
    try {
      const response = await fetch(`${apiUrl}/simulation-topics/seed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchTopics();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || 'Failed to seed default topics');
      }
    } catch (err) {
      console.error('Error seeding topics:', err);
      alert('Failed to seed default topics');
    } finally {
      setIsSeeding(false);
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────────

  const filteredTopics = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (SCENARIO_TYPE_LABELS[topic.scenarioType] || topic.scenarioType)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const activeCount = topics.filter((t) => t.isActive).length;
  const linkedCount = topics.filter((t) => t.courseId).length;

  const getScenarioLabel = (type: string) => SCENARIO_TYPE_LABELS[type] || type;
  const getScenarioColor = (type: string) =>
    SCENARIO_TYPE_COLORS[type] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  const getCourseNameById = (courseId: string | null) => {
    if (!courseId) return null;
    const topic = topics.find((t) => t.courseId === courseId && t.course);
    return topic?.course?.titleEn || null;
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0089B8]" />
          <p className="text-sm text-muted-foreground">Loading simulation topics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={fetchTopics} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0089B8] flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            Simulation Topics
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage AI simulation training scenarios and topics
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {topics.length === 0 && (
            <Button
              variant="outline"
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
            >
              {isSeeding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Seed Defaults
            </Button>
          )}
          <Button variant="outline" onClick={fetchTopics} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={openCreateDialog}
            className="bg-[#0089B8] hover:bg-[#0089B8]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Topic
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0089B8]/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-[#0089B8]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{topics.length}</p>
                <p className="text-xs text-muted-foreground">Total Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Link className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{linkedCount}</p>
                <p className="text-xs text-muted-foreground">Linked to Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search topics by name, description, or scenario type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className={cn(
                'group transition-all duration-200 hover:shadow-lg hover:border-[#0089B8]/30',
                !topic.isActive && 'opacity-60'
              )}
            >
              <CardContent className="p-5">
                {/* Title and Status */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-foreground line-clamp-1 flex-1 pr-2">
                    {topic.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs shrink-0',
                      topic.isActive
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    )}
                  >
                    {topic.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                  {topic.description || 'No description'}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', getScenarioColor(topic.scenarioType))}
                  >
                    {getScenarioLabel(topic.scenarioType)}
                  </Badge>
                  {topic.course && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-[#0089B8]/10 text-[#0089B8] border-[#0089B8]/20"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      {topic.course.titleEn}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Order: {topic.sortOrder}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-[#0089B8]/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(topic);
                      }}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground hover:text-[#0089B8]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(topic);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No topics match your search' : 'No simulation topics yet'}
          </p>
          {!searchTerm && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                variant="link"
                onClick={openCreateDialog}
                className="text-[#0089B8]"
              >
                Create your first topic
              </Button>
              <span className="text-muted-foreground">or</span>
              <Button
                variant="link"
                onClick={handleSeedDefaults}
                disabled={isSeeding}
                className="text-blue-600"
              >
                {isSeeding ? 'Seeding...' : 'Seed default topics'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ─── Create / Edit Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={isFormDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormDialogOpen(false);
            setEditingTopic(null);
            setFormData(DEFAULT_FORM_DATA);
          }
        }}
      >
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#0089B8]" />
              {editingTopic ? 'Edit Topic' : 'Create New Topic'}
            </DialogTitle>
            <DialogDescription>
              {editingTopic
                ? 'Update the simulation topic details'
                : 'Set up a new simulation training topic'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., HVAC Troubleshooting Basics"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this simulation topic..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            {/* Scenario Type */}
            <div className="space-y-2">
              <Label>Scenario Type</Label>
              <Select
                value={formData.scenarioType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, scenarioType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario type" />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIO_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <Label>System Prompt (optional)</Label>
              <Textarea
                placeholder="Custom AI instructions for this simulation scenario..."
                value={formData.systemPrompt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))
                }
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Custom instructions sent to the AI for this simulation. Leave empty to use the default prompt.
              </p>
            </div>

            {/* Linked Course */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#0089B8]" />
                Linked Course
              </Label>
              <Select
                value={formData.courseId || 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    courseId: value === 'none' ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.titleEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Link this topic to a course so students see it in context.
              </p>
            </div>

            {/* Sort Order and Active */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Active</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                    className="data-[state=checked]:bg-[#0089B8]"
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormDialogOpen(false);
                setEditingTopic(null);
                setFormData(DEFAULT_FORM_DATA);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title.trim() || isSaving}
              className="bg-[#0089B8] hover:bg-[#0089B8]/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editingTopic ? 'Updating...' : 'Creating...'}
                </>
              ) : editingTopic ? (
                'Update Topic'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Topic
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ───────────────────────────────────── */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteDialogOpen(false);
            setDeletingTopic(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Topic
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTopic?.title}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingTopic && (
            <div className="py-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="font-medium">{deletingTopic.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getScenarioLabel(deletingTopic.scenarioType)}
                  {deletingTopic.course && ` - ${deletingTopic.course.titleEn}`}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingTopic(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

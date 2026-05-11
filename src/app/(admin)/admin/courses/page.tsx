'use client';

/**
 * Admin Courses Management Page
 *
 * Allows org admins to manage training courses:
 * - View all courses in a grid
 * - Create new courses
 * - Edit course details, lectures, attachments
 * - Publish/unpublish courses
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import {
  adminCoursesApi,
  Course,
  CourseCategory,
  CourseDifficulty,
  CategoryOption,
  DifficultyOption,
  CreateCourseData,
} from '@/lib/api/admin-courses.api';
import {
  BookOpen,
  Plus,
  Video,
  FileText,
  Loader2,
  AlertCircle,
  GraduationCap,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  X,
  ChevronDown,
  Check,
} from 'lucide-react';

// Category icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  fundamentals: GraduationCap,
  hvac: BookOpen,
  electrical: BookOpen,
  plc_automation: BookOpen,
  maintenance: BookOpen,
  safety: BookOpen,
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  fundamentals: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  hvac: 'bg-[#0089B8]/10 text-[#0089B8] border-[#0089B8]/20',
  electrical: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  plc_automation: 'bg-[#0089B8]/10 text-[#0089B8] border-[#0089B8]/20',
  maintenance: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  safety: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// Difficulty colors
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-500',
  intermediate: 'bg-blue-500/10 text-blue-500',
  advanced: 'bg-[#0089B8]/10 text-[#0089B8]',
};

// Gradient colors for course thumbnails
const GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-[#0089B8] to-[#0089B8]',
  'from-blue-500 to-blue-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-[#0089B8] to-[#0089B8]',
];

export default function AdminCoursesPage() {
  const { isRTL, language } = useLanguage();
  const { token } = useAuthStore();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Category state
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryEn, setNewCategoryEn] = useState('');
  const [newCategoryAr, setNewCategoryAr] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Add Difficulty state
  const [addDifficultyOpen, setAddDifficultyOpen] = useState(false);
  const [newDifficultyEn, setNewDifficultyEn] = useState('');
  const [newDifficultyAr, setNewDifficultyAr] = useState('');
  const [difficultyError, setDifficultyError] = useState<string | null>(null);
  const [isAddingDifficulty, setIsAddingDifficulty] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<CourseDifficulty | 'all'>('all');

  // New course form
  const [newCourse, setNewCourse] = useState<CreateCourseData>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'fundamentals',
    difficulty: 'beginner',
    estimatedDurationMinutes: 60,
  });

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminCoursesApi.listCourses({
        category: categoryFilter,
        difficulty: difficultyFilter,
        search: searchQuery || undefined,
      });
      setCourses(data.courses);
      setCategories((data.categories || []).filter(c => c.value));
      setDifficulties((data.difficulties || []).filter(d => d.value));
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, [token, categoryFilter, difficultyFilter, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Toggle publish status
  const handleTogglePublish = async (course: Course) => {
    try {
      await adminCoursesApi.togglePublish(course.id, !course.isPublished);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isPublished: !c.isPublished } : c))
      );
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  // Create new course
  const handleCreateCourse = async () => {
    if (!newCourse.titleEn) {
      return;
    }

    try {
      setIsCreating(true);
      const data = await adminCoursesApi.createCourse(newCourse);
      setCreateDialogOpen(false);
      setNewCourse({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        category: 'fundamentals',
        difficulty: 'beginner',
        estimatedDurationMinutes: 60,
      });
      // Navigate to the new course's page
      router.push(`/admin/courses/${data.course.id}`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setIsDeleting(true);
      await adminCoursesApi.deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategoryEn.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    try {
      setIsAddingCategory(true);
      setCategoryError(null);
      const data = await adminCoursesApi.createCategory({
        labelEn: newCategoryEn.trim(),
        labelAr: newCategoryAr.trim() || newCategoryEn.trim(),
      });
      setCategories((prev) => [...prev, data.category]);
      setAddCategoryOpen(false);
      setNewCategoryEn('');
      setNewCategoryAr('');
    } catch (err: any) {
      const msg = err?.message || 'Failed to create category';
      setCategoryError(msg.includes('already exists') ? 'Category already exists' : msg);
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string, categoryValue: string) => {
    try {
      await adminCoursesApi.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      if (categoryFilter === categoryValue) {
        setCategoryFilter('all');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Add new difficulty
  const handleAddDifficulty = async () => {
    if (!newDifficultyEn.trim()) {
      setDifficultyError('Difficulty name is required');
      return;
    }

    try {
      setIsAddingDifficulty(true);
      setDifficultyError(null);
      const data = await adminCoursesApi.createDifficulty({
        labelEn: newDifficultyEn.trim(),
        labelAr: newDifficultyAr.trim() || newDifficultyEn.trim(),
      });
      setDifficulties((prev) => [...prev, data.difficulty]);
      setAddDifficultyOpen(false);
      setNewDifficultyEn('');
      setNewDifficultyAr('');
    } catch (err: any) {
      const msg = err?.message || 'Failed to create difficulty';
      setDifficultyError(msg.includes('already exists') ? 'Difficulty level already exists' : msg);
    } finally {
      setIsAddingDifficulty(false);
    }
  };

  // Delete difficulty
  const handleDeleteDifficulty = async (difficultyId: string, difficultyValue: string) => {
    try {
      await adminCoursesApi.deleteDifficulty(difficultyId);
      setDifficulties((prev) => prev.filter((d) => d.id !== difficultyId));
      if (difficultyFilter === difficultyValue) {
        setDifficultyFilter('all');
      }
    } catch (err) {
      console.error('Error deleting difficulty:', err);
    }
  };

  // Get gradient for course thumbnail
  const getGradient = (index: number) => GRADIENTS[index % GRADIENTS.length];

  // Get category label
  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? (cat.labelEn) : category;
  };

  // Get difficulty label
  const getDifficultyLabel = (difficulty: string) => {
    const diff = difficulties.find((d) => d.value === difficulty);
    return diff ? (diff.labelEn) : difficulty;
  };

  // RTL-aware chevron
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={fetchCourses} variant="outline">
            {'Try Again'}
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
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            {'Course Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {'Add and manage training courses for your students'}
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#0089B8] hover:bg-[#0089B8]/90"
        >
          <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
          {'Add Course'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0089B8]/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-[#0089B8]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">
                  {'Total Courses'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.filter((c) => c.isPublished).length}</p>
                <p className="text-xs text-muted-foreground">{'Published'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.filter((c) => !c.isPublished).length}</p>
                <p className="text-xs text-muted-foreground">{'Draft'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, c) => sum + (c._count?.lectures || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {'Total Lectures'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
              isRTL ? 'right-3' : 'left-3'
            )}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={'Search courses...'}
            className={cn('h-10', isRTL ? 'pr-10' : 'pl-10')}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px] h-10 justify-between">
                <span className="flex items-center gap-2 truncate">
                  <Filter className="h-4 w-4 shrink-0" />
                  {categoryFilter === 'all' ? 'All Categories' : getCategoryLabel(categoryFilter)}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              <DropdownMenuItem
                onClick={() => setCategoryFilter('all')}
                className="justify-between"
              >
                All Categories
                {categoryFilter === 'all' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.map((cat) => (
                <DropdownMenuItem
                  key={cat.value}
                  className="justify-between group pr-1"
                  onClick={() => setCategoryFilter(cat.value)}
                >
                  <span className="flex items-center gap-2 truncate">
                    {categoryFilter === cat.value && <Check className="h-3 w-3 shrink-0" />}
                    <span className={categoryFilter !== cat.value ? 'ml-5' : ''}>{cat.labelEn}</span>
                  </span>
                  {cat.id && (
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id!, cat.value);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => { setAddCategoryOpen(true); setCategoryError(null); }}
            title="Add Category"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[180px] h-10 justify-between">
                <span className="truncate">
                  {difficultyFilter === 'all' ? 'All Levels' : getDifficultyLabel(difficultyFilter)}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem
                onClick={() => setDifficultyFilter('all')}
                className="justify-between"
              >
                All Levels
                {difficultyFilter === 'all' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {difficulties.map((diff) => (
                <DropdownMenuItem
                  key={diff.value}
                  className="justify-between group pr-1"
                  onClick={() => setDifficultyFilter(diff.value)}
                >
                  <span className="flex items-center gap-2 truncate">
                    {difficultyFilter === diff.value && <Check className="h-3 w-3 shrink-0" />}
                    <span className={difficultyFilter !== diff.value ? 'ml-5' : ''}>{diff.labelEn}</span>
                  </span>
                  {diff.id && (
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDifficulty(diff.id!, diff.value);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => { setAddDifficultyOpen(true); setDifficultyError(null); }}
            title="Add Level"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course, index) => {
          const CategoryIcon = CATEGORY_ICONS[course.category] || BookOpen;

          return (
            <Card
              key={course.id}
              className={cn(
                'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-[#0089B8]/30 h-full',
                !course.isPublished && 'opacity-70'
              )}
              onClick={() => router.push(`/admin/courses/${course.id}`)}
            >
              <CardContent className="p-0 flex flex-col h-full">
                {/* Thumbnail */}
                <div
                  className={cn(
                    'h-32 rounded-t-lg flex items-center justify-center bg-gradient-to-br',
                    getGradient(index)
                  )}
                >
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.titleEn}
                      className="h-full w-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-white/80" />
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Header + Description */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-[#0089B8] transition-colors">
                          {course.titleEn}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={course.isPublished}
                          onCheckedChange={() => handleTogglePublish(course)}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {course.descriptionEn}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3 mb-3">
                    <Badge
                      variant={course.isPublished ? 'default' : 'secondary'}
                      className={cn('text-xs', course.isPublished ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600')}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', CATEGORY_COLORS[course.category] || '')}
                    >
                      <CategoryIcon className="h-3 w-3" />
                      {getCategoryLabel(course.category)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', DIFFICULTY_COLORS[course.difficulty] || '')}
                    >
                      {getDifficultyLabel(course.difficulty)}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>{course._count?.lectures || 0}</span>
                      <span className="text-xs">{'lectures'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">{formatDuration(course.estimatedDurationMinutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseToDelete(course);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                      <ChevronIcon className="h-4 w-4 text-muted-foreground group-hover:text-[#0089B8] transition-colors" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Course Card */}
        <Card
          className="group cursor-pointer border-dashed border-2 hover:border-[#0089B8]/50 transition-all duration-200"
          onClick={() => setCreateDialogOpen(true)}
        >
          <CardContent className="p-5 flex flex-col items-center justify-center min-h-[280px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0089B8]/10 flex items-center justify-center mb-4 group-hover:bg-[#0089B8]/20 transition-colors">
              <Plus className="h-8 w-8 text-[#0089B8]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {'Add New Course'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {'Create a new training course'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {'Delete Course'}
            </DialogTitle>
            <DialogDescription>
              {'Are you sure you want to delete this course? All lectures and attachments will be deleted.'}
            </DialogDescription>
          </DialogHeader>

          {courseToDelete && (
            <div className="py-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="font-medium">
                  {courseToDelete.titleEn}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {courseToDelete._count?.lectures || 0} {'lectures'} •{' '}
                  {courseToDelete._count?.attachments || 0} {'attachments'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                  {'Deleting...'}
                </>
              ) : (
                <>
                  <Trash2 className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {'Delete'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Course Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#0089B8]" />
              {'Add New Course'}
            </DialogTitle>
            <DialogDescription>
              {'Enter basic information for the new course'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* TEMPORARY: Arabic fields hidden — English only mode */}
            <div className="space-y-2">
              <Label>{'Title *'}</Label>
              <Input
                value={newCourse.titleEn}
                onChange={(e) => setNewCourse((prev) => ({ ...prev, titleEn: e.target.value, titleAr: e.target.value }))}
                placeholder="e.g., Electromechanical Student Fundamentals"
              />
            </div>

            <div className="space-y-2">
              <Label>{'Description'}</Label>
              <Textarea
                value={newCourse.descriptionEn || ''}
                onChange={(e) =>
                  setNewCourse((prev) => ({ ...prev, descriptionEn: e.target.value, descriptionAr: e.target.value }))
                }
                placeholder="Course description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{'Category'}</Label>
                <Select
                  value={newCourse.category}
                  onValueChange={(value) =>
                    setNewCourse((prev) => ({ ...prev, category: value as CourseCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{'Level'}</Label>
                <Select
                  value={newCourse.difficulty}
                  onValueChange={(value) =>
                    setNewCourse((prev) => ({ ...prev, difficulty: value as CourseDifficulty }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{'Duration (min)'}</Label>
                <Input
                  type="number"
                  value={newCourse.estimatedDurationMinutes || 60}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      estimatedDurationMinutes: parseInt(e.target.value) || 60,
                    }))
                  }
                  min={1}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {'Cancel'}
            </Button>
            <Button
              onClick={handleCreateCourse}
              disabled={isCreating || !newCourse.titleEn}
              className="bg-[#0089B8]"
            >
              {isCreating ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                  {'Creating...'}
                </>
              ) : (
                <>
                  <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {'Save as Draft'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#0089B8]" />
              {'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {'Create a new course category for your organization'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{'Category Name (English) *'}</Label>
              <Input
                value={newCategoryEn}
                onChange={(e) => { setNewCategoryEn(e.target.value); setCategoryError(null); }}
                placeholder="e.g., Renewable Energy"
              />
            </div>
            <div className="space-y-2">
              <Label>{'Category Name (Arabic)'}</Label>
              <Input
                value={newCategoryAr}
                onChange={(e) => setNewCategoryAr(e.target.value)}
                placeholder="e.g., الطاقة المتجددة"
                dir="rtl"
              />
            </div>
            {categoryError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {categoryError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryOpen(false)}>
              {'Cancel'}
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={isAddingCategory}
              className="bg-[#0089B8] hover:bg-[#0089B8]/90"
            >
              {isAddingCategory ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Difficulty Dialog */}
      <Dialog open={addDifficultyOpen} onOpenChange={setAddDifficultyOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#0089B8]" />
              {'Add Level'}
            </DialogTitle>
            <DialogDescription>
              {'Create a new difficulty level for your organization'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{'Level Name (English) *'}</Label>
              <Input
                value={newDifficultyEn}
                onChange={(e) => { setNewDifficultyEn(e.target.value); setDifficultyError(null); }}
                placeholder="e.g., Expert"
              />
            </div>
            <div className="space-y-2">
              <Label>{'Level Name (Arabic)'}</Label>
              <Input
                value={newDifficultyAr}
                onChange={(e) => setNewDifficultyAr(e.target.value)}
                placeholder="e.g., خبير"
                dir="rtl"
              />
            </div>
            {difficultyError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {difficultyError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDifficultyOpen(false)}>
              {'Cancel'}
            </Button>
            <Button
              onClick={handleAddDifficulty}
              disabled={isAddingDifficulty}
              className="bg-[#0089B8] hover:bg-[#0089B8]/90"
            >
              {isAddingDifficulty ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add Level'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

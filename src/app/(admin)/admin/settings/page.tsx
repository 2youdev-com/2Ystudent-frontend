'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore, usePermissions } from '@/stores/auth.store';
import { settingsApi, type SystemInfo } from '@/lib/api/settings.api';
import { cn } from '@/lib/utils';
import {
  Building2,
  Bell,
  Shield,
  Mail,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { isRTL } = useLanguage();
  const { user } = useAuthStore();
  const { isAdmin } = usePermissions();

  // Organization state
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgSuccess, setOrgSuccess] = useState(false);

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [lowScoreAlerts, setLowScoreAlerts] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // System info state
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoadingSystem, setIsLoadingSystem] = useState(true);

  // Reset data state
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Fetch organization settings
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoadingOrg(true);
      const org = await settingsApi.getOrganization();
      setOrgName(org.name);
      setContactEmail(org.contactEmail);
      setEmailNotifications(org.settings.emailNotifications);
      setWeeklyReports(org.settings.weeklyReports);
      setLowScoreAlerts(org.settings.lowScoreAlerts);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setOrgError('Failed to load settings');
    } finally {
      setIsLoadingOrg(false);
    }
  }, [isRTL]);

  // Fetch system info
  const fetchSystemInfo = useCallback(async () => {
    try {
      setIsLoadingSystem(true);
      const info = await settingsApi.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    } finally {
      setIsLoadingSystem(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchSystemInfo();
  }, [fetchSettings, fetchSystemInfo]);

  // Save organization settings
  const handleSaveOrganization = async () => {
    if (!isAdmin) return;

    try {
      setIsSavingOrg(true);
      setOrgError(null);
      setOrgSuccess(false);

      await settingsApi.updateOrganization({
        name: orgName,
        contactEmail: contactEmail,
      });

      setOrgSuccess(true);
      setTimeout(() => setOrgSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save organization:', error);
      setOrgError('Failed to save settings');
    } finally {
      setIsSavingOrg(false);
    }
  };

  // Save notification settings
  const handleSaveNotifications = async (key: string, value: boolean) => {
    if (!isAdmin) return;

    try {
      setIsSavingNotifications(true);

      await settingsApi.updateNotifications({
        [key]: value,
      });

      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save notifications:', error);
      // Revert the toggle on error
      if (key === 'emailNotifications') setEmailNotifications(!value);
      if (key === 'weeklyReports') setWeeklyReports(!value);
      if (key === 'lowScoreAlerts') setLowScoreAlerts(!value);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (key: string, value: boolean) => {
    if (key === 'emailNotifications') setEmailNotifications(value);
    if (key === 'weeklyReports') setWeeklyReports(value);
    if (key === 'lowScoreAlerts') setLowScoreAlerts(value);
    handleSaveNotifications(key, value);
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      await settingsApi.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Reset data
  const handleResetData = async () => {
    if (!isAdmin) return;

    try {
      setIsResetting(true);
      setResetError(null);

      await settingsApi.resetData(resetConfirmText);

      setResetConfirmText('');
      alert('All training data has been reset successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset data';
      setResetError(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {'Settings'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {'Manage system settings and preferences'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Building2 className="h-5 w-5 text-[#0089B8]" />
              {'Organization Settings'}
            </CardTitle>
            <CardDescription>
              {'Basic organization information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingOrg ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="org-name" className="text-sm font-medium text-foreground">
                    {'Organization Name'}
                  </label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="bg-background border-border"
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                    {'Contact Email'}
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-background border-border"
                    disabled={!isAdmin}
                  />
                </div>

                {orgError && (
                  <p className="text-sm text-destructive">{orgError}</p>
                )}

                {orgSuccess && (
                  <p className="text-sm text-blue-500 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {'Saved successfully'}
                  </p>
                )}

                {isAdmin && (
                  <Button
                    onClick={handleSaveOrganization}
                    disabled={isSavingOrg}
                    className="bg-[#0089B8] hover:bg-[#0089B8]/90 text-white"
                  >
                    {isSavingOrg ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className={cn(isRTL ? "mr-2" : "ml-2")}>
                      {'Save Changes'}
                    </span>
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-[#0089B8]" />
              {'Notification Settings'}
              {isSavingNotifications && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {notificationSuccess && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </CardTitle>
            <CardDescription>
              {'Control notifications and alerts'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {'Email Notifications'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {'Receive notifications via email'}
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(value) => handleNotificationToggle('emailNotifications', value)}
                disabled={!isAdmin || isSavingNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {'Weekly Reports'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {'Weekly performance summary'}
                  </p>
                </div>
              </div>
              <Switch
                checked={weeklyReports}
                onCheckedChange={(value) => handleNotificationToggle('weeklyReports', value)}
                disabled={!isAdmin || isSavingNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {'Low Score Alerts'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {'Alert when scores drop below 60%'}
                  </p>
                </div>
              </div>
              <Switch
                checked={lowScoreAlerts}
                onCheckedChange={(value) => handleNotificationToggle('lowScoreAlerts', value)}
                disabled={!isAdmin || isSavingNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-[#0089B8]" />
              {'Security'}
            </CardTitle>
            <CardDescription>
              {'Security and access settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <p className="font-medium text-blue-500">
                  {'Account Secured'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {'All security settings are up to date'}
              </p>
            </div>

            {/* Password Change Form */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {'Change Password'}
              </p>

              <Input
                id="current-password"
                type="password"
                placeholder={'Current Password'}
                aria-label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-background border-border"
              />
              <Input
                id="new-password"
                type="password"
                placeholder={'New Password'}
                aria-label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background border-border"
              />
              <Input
                id="confirm-password"
                type="password"
                placeholder={'Confirm New Password'}
                aria-label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border"
              />

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}

              {passwordSuccess && (
                <p className="text-sm text-blue-500 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {'Password changed successfully'}
                </p>
              )}

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                variant="outline"
                className="w-full"
              >
                {isChangingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span className={cn(isRTL ? "mr-2" : "ml-2")}>
                  {'Update Password'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Info className="h-5 w-5 text-[#0089B8]" />
                {'System Information'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchSystemInfo}
                disabled={isLoadingSystem}
              >
                <RefreshCw className={cn("h-4 w-4", isLoadingSystem && "animate-spin")} />
              </Button>
            </div>
            <CardDescription>
              {'System and version information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingSystem ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : systemInfo ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{'Version'}</span>
                  <Badge variant="outline" className="border-[#0089B8]/30 text-[#0089B8]">
                    v{systemInfo.version}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{'Environment'}</span>
                  <Badge variant="outline" className={cn(
                    systemInfo.environment === 'production'
                      ? 'border-blue-500/30 text-blue-500'
                      : 'border-blue-500/30 text-blue-500'
                  )}>
                    {systemInfo.environment.charAt(0).toUpperCase() + systemInfo.environment.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{'Database'}</span>
                  <Badge variant="outline" className={cn(
                    systemInfo.database === 'connected'
                      ? 'border-blue-500/30 text-blue-500'
                      : 'border-destructive/30 text-destructive'
                  )}>
                    {systemInfo.database === 'connected' ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{'API Status'}</span>
                  <Badge variant="outline" className={cn(
                    systemInfo.apiStatus === 'operational'
                      ? 'border-blue-500/30 text-blue-500'
                      : 'border-amber-500/30 text-amber-500'
                  )}>
                    {systemInfo.apiStatus === 'operational' ? 'Operational' : 'Limited'}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {'Failed to load system info'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone - Only for admin */}
      {isAdmin && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {'Danger Zone'}
            </CardTitle>
            <CardDescription>
              {'Irreversible actions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">
                    {'Reset All Data'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {'Delete all training data and reports'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="reset-confirm"
                    placeholder={'Type DELETE ALL DATA to confirm'}
                    aria-label="Type DELETE ALL DATA to confirm"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    className="w-64 bg-background border-border text-sm"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetData}
                    disabled={resetConfirmText !== 'DELETE ALL DATA' || isResetting}
                  >
                    {isResetting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Reset'
                    )}
                  </Button>
                </div>
              </div>
              {resetError && (
                <p className="text-sm text-destructive mt-2">{resetError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

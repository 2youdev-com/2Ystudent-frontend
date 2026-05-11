'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useSuperAdminApi,
  type PlatformOverview,
  type RevenueMetrics,
  type ApiUsageMetrics,
  type OrganizationSummary,
  type PaginatedResult,
} from '@/hooks/useSuperAdminApi';
import { cn } from '@/lib/utils';
import {
  Users,
  Building2,
  Mic,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export default function ReportsPage() {
  const { isRTL } = useLanguage();
  const api = useSuperAdminApi();
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [apiUsageMetrics, setApiUsageMetrics] = useState<ApiUsageMetrics | null>(null);
  const [topOrgs, setTopOrgs] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardData, revenueData, apiData, orgsData] = await Promise.all([
        api.getDashboard(),
        api.getRevenueMetrics(period),
        api.getApiUsageMetrics({ period }),
        api.getOrganizations({ limit: 5 }),
      ]);

      setOverview(dashboardData);
      setRevenueMetrics(revenueData);
      setApiUsageMetrics(apiData);
      setTopOrgs(orgsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('en-US').format(num);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', isRTL && 'rtl')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Platform-wide analytics across all organizations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Platform Overview - Users & Orgs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalUsers || 0)}</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-green-500 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {formatNumber(overview?.activeUsersLast30Days || 0)} active
              </span>
              <span className="text-muted-foreground">last 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalOrganizations || 0)}</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-green-500">{overview?.activeOrganizations || 0} active</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-amber-500">{overview?.suspendedOrganizations || 0} suspended</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalSimulations || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Total simulations completed
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalVoiceSessions || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Total voice sessions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & API Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Revenue Summary
            </CardTitle>
            <CardDescription>Monthly and annual revenue metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">MRR</p>
                <p className="text-xl font-bold">{formatCurrency(revenueMetrics?.currentMRR || 0)}</p>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  {(revenueMetrics?.mrrGrowthPercent || 0) >= 0 ? (
                    <span className="text-green-500 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      +{revenueMetrics?.mrrGrowthPercent.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3" />
                      {revenueMetrics?.mrrGrowthPercent.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">ARR</p>
                <p className="text-xl font-bold">{formatCurrency(revenueMetrics?.arr || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Annualized</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Subscriptions</span>
                <span className="font-semibold">{revenueMetrics?.activeSubscriptions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trial Subscriptions</span>
                <span className="font-semibold text-amber-500">{revenueMetrics?.trialSubscriptions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Churn Rate</span>
                <span className="font-semibold">{revenueMetrics?.churnRate.toFixed(1) || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Usage Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              API Usage Summary
            </CardTitle>
            <CardDescription>Cost and request breakdown by provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-xl font-bold">{formatCurrency(apiUsageMetrics?.totalCost || 0)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Requests</p>
                <p className="text-xl font-bold">{formatNumber(apiUsageMetrics?.totalRequests || 0)}</p>
              </div>
            </div>
            <div className="space-y-3">
              {apiUsageMetrics?.costByProvider.map((provider) => (
                <div key={provider.provider} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{provider.provider}</span>
                    <span>{formatCurrency(provider.cost)} ({formatNumber(provider.requests)} reqs)</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${provider.percentOfTotal}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Organizations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Organizations Overview
              </CardTitle>
              <CardDescription>Top organizations by user count</CardDescription>
            </div>
            <Link href="/super-admin/organizations">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Organization</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Users</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Active</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plan</th>
                </tr>
              </thead>
              <tbody>
                {topOrgs.map((org) => (
                  <tr key={org.id} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2">
                      <Link
                        href={`/super-admin/organizations/${org.id}`}
                        className="font-medium hover:text-rose-500 transition-colors"
                      >
                        {org.name}
                      </Link>
                    </td>
                    <td className="py-3 px-2">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        org.status === 'active' ? 'bg-green-500/10 text-green-500' :
                        org.status === 'suspended' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      )}>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">{org.userCount}</td>
                    <td className="py-3 px-2">
                      <span className="text-green-500">{org.activeUserCount}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={cn(
                        'text-xs',
                        org.subscriptionPlan ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {org.subscriptionPlan || 'No plan'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Plan */}
      {revenueMetrics?.revenueByPlan && revenueMetrics.revenueByPlan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-rose-500" />
              Revenue by Plan
            </CardTitle>
            <CardDescription>Revenue distribution across subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueMetrics.revenueByPlan.map((plan) => (
                <div key={plan.planId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.displayName}</span>
                      <span className="text-sm text-muted-foreground">({plan.count} subscribers)</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(plan.revenue)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                      style={{ width: `${plan.percentOfTotal}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

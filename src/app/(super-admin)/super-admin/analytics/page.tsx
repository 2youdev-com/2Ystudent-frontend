'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSuperAdminApi, type RevenueMetrics, type ApiUsageMetrics } from '@/hooks/useSuperAdminApi';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Users,
  Zap,
  Mic,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
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

export default function AnalyticsPage() {
  const { isRTL } = useLanguage();
  const api = useSuperAdminApi();
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [apiUsageMetrics, setApiUsageMetrics] = useState<ApiUsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenueData, apiUsageData] = await Promise.all([
        api.getRevenueMetrics(period),
        api.getApiUsageMetrics({ period }),
      ]);

      setRevenueMetrics(revenueData);
      setApiUsageMetrics(apiUsageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'elevenlabs':
        return 'bg-rose-500';
      case 'gemini':
        return 'bg-blue-500';
      case 'claude':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchMetrics} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', isRTL && 'rtl')}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Revenue metrics and API usage
          </p>
        </div>
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

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Revenue (MRR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueMetrics?.currentMRR || 0)}</div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {(revenueMetrics?.mrrGrowthPercent || 0) >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{revenueMetrics?.mrrGrowthPercent.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{revenueMetrics?.mrrGrowthPercent.toFixed(1)}%</span>
                </>
              )}
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Annual Revenue (ARR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueMetrics?.arr || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on current MRR
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueMetrics?.activeSubscriptions || 0}</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-amber-500">{revenueMetrics?.trialSubscriptions || 0} trial</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{revenueMetrics?.cancelledSubscriptions || 0} cancelled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueMetrics?.churnRate.toFixed(1) || 0}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              This month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-rose-500" />
            Revenue by Plan
          </CardTitle>
          <CardDescription>
            Revenue distribution across subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueMetrics?.revenueByPlan.map((plan) => (
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
                <p className="text-xs text-muted-foreground">{plan.percentOfTotal.toFixed(1)}% of total</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Usage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Cost Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              API Costs
            </CardTitle>
            <CardDescription>
              API costs by provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-6">
              {formatCurrency(apiUsageMetrics?.totalCost || 0)}
              <span className="text-sm font-normal text-muted-foreground ms-2">
                ({formatNumber(apiUsageMetrics?.totalRequests || 0)} requests)
              </span>
            </div>
            <div className="space-y-4">
              {apiUsageMetrics?.costByProvider.map((provider) => (
                <div key={provider.provider} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', getProviderColor(provider.provider))} />
                      <span className="font-medium">{provider.provider}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(provider.cost)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', getProviderColor(provider.provider))}
                      style={{ width: `${provider.percentOfTotal}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(provider.requests)} requests • {provider.percentOfTotal.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Organizations by Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Top Organizations by Usage
            </CardTitle>
            <CardDescription>
              Organizations with highest API usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiUsageMetrics?.costByOrganization.map((org, index) => (
                <div key={org.orgId} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/super-admin/organizations/${org.orgId}`}
                      className="font-medium hover:text-rose-500 transition-colors truncate block"
                    >
                      {org.orgName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(org.requests)} requests
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(org.cost)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/super-admin/reports">
                <Button variant="ghost" className="w-full">
                  View Full Report
                  <ArrowUpRight className="h-4 w-4 ms-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/super-admin/reports">
          <Card className="hover:border-rose-500/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-rose-500/10">
                  <DollarSign className="h-6 w-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Detailed Revenue Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive revenue and subscription analysis
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground ms-auto" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/super-admin/reports">
          <Card className="hover:border-rose-500/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Zap className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">API Usage Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Usage details and costs by provider
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground ms-auto" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

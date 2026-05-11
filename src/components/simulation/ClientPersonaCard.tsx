'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Smile, Meh, Frown } from 'lucide-react';
import type { MentorProfile, Sentiment } from '@/types/entities';
import type { ConversationState } from '@/types/simulation.types';
import { cn } from '@/lib/utils/cn';

interface MentorCardProps {
  /** AI Mentor Profile data */
  mentor: MentorProfile;
  sentiment: Sentiment;
  conversationState: ConversationState | null;
}

const personalityColors = {
  supportive: 'bg-green-100 text-green-800',
  challenging: 'bg-yellow-100 text-yellow-800',
  methodical: 'bg-red-100 text-red-800',
  socratic: 'bg-purple-100 text-purple-800',
  analytical: 'bg-blue-100 text-blue-800',
};

// Personality labels
const personalityLabels: Record<string, string> = {
  supportive: 'Supportive',
  challenging: 'Challenging',
  methodical: 'Methodical',
  socratic: 'Socratic',
  analytical: 'Analytical',
};

// State labels
const stateLabels: Record<ConversationState, string> = {
  introduction: 'Introduction',
  assessment: 'Assessment',
  discussion: 'Discussion',
  deep_dive: 'Deep Dive',
  review: 'Review',
  ended: 'Ended',
};

const SentimentIcon = ({ sentiment }: { sentiment: Sentiment }) => {
  switch (sentiment) {
    case 'positive':
      return <Smile className="h-5 w-5 text-green-500" />;
    case 'negative':
      return <Frown className="h-5 w-5 text-red-500" />;
    default:
      return <Meh className="h-5 w-5 text-gray-500" />;
  }
};

export function MentorCard({ mentor, sentiment, conversationState }: MentorCardProps) {
  return (
    <Card className="flex-grow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="h-6 w-6" />
          </div>

          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold">
                {mentor.name}
              </h3>
              <Badge variant="outline" className={cn(personalityColors[mentor.personality])}>
                {personalityLabels[mentor.personality] || mentor.personality}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {mentor.background}
            </p>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Engagement:</span>
                <SentimentIcon sentiment={sentiment} />
              </div>

              {conversationState && (
                <Badge variant="secondary" className="text-xs">
                  {stateLabels[conversationState]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Backward compatibility alias
export const ClientPersonaCard = MentorCard;

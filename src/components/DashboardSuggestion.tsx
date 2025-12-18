import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SuggestionProps {
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline';
}

export function DashboardSuggestion({ 
  title, 
  description, 
  action, 
  onClick, 
  variant = 'default' 
}: SuggestionProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Suggested Next Task</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
          <p className="text-muted-foreground max-w-xl">{description}</p>
        </div>
        
        <Button onClick={onClick} variant={variant} className="shrink-0 group">
          {action}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}

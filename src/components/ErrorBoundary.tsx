// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-background gap-4">
          <AlertTriangle size={40} className="text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Something went wrong rendering this report</h2>
          <p className="text-sm text-muted-foreground max-w-md font-mono">{this.state.error.message}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

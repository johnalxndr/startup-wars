import React from 'react';

interface GameHeaderProps {
  title: string;
  subtitle: string;
}

export function GameHeader({ title, subtitle }: GameHeaderProps) {
  return (
    <header className="text-center">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </header>
  );
}
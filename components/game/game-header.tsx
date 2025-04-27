import React from 'react';

interface GameHeaderProps {
  title: string;
}

export function GameHeader({ title }: GameHeaderProps) {
  return (
    <header className="text-center">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
    </header>
  );
}
'use client';

import { Note } from '@/app/actions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NotesListProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function NotesList({ notes, selectedId, onSelect }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        No notes yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => (
        <Card
          key={note.id}
          className={cn(
            'cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900',
            selectedId === note.id && 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900'
          )}
          onClick={() => onSelect(note.id)}
        >
          <CardHeader className="p-4">
            <CardTitle className="text-base">{note.title}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {note.content || 'No content'}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

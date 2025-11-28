'use client';

import { getNote, getNotes, Note } from '@/app/actions';
import { NoteEditor } from '@/components/note-editor';
import { NotesList } from '@/components/notes-list';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useTransition } from 'react';

interface NotesAppProps {
  initialNotes: Note[];
}

export function NotesApp({ initialNotes }: NotesAppProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (selectedId) {
      startTransition(async () => {
        const note = await getNote(selectedId);
        setSelectedNote(note);
      });
    } else {
      setSelectedNote(null);
    }
  }, [selectedId]);

  async function refreshNotes() {
    startTransition(async () => {
      const updated = await getNotes();
      setNotes(updated);
    });
  }

  function handleSelect(id: string) {
    setIsCreating(false);
    setSelectedId(id);
  }

  function handleNew() {
    setSelectedId(null);
    setSelectedNote(null);
    setIsCreating(true);
  }

  function handleCancel() {
    setIsCreating(false);
    setSelectedId(null);
    setSelectedNote(null);
  }

  function handleSave() {
    refreshNotes();
    setIsCreating(false);
    setSelectedId(null);
    setSelectedNote(null);
  }

  function handleDelete() {
    refreshNotes();
    setSelectedId(null);
    setSelectedNote(null);
  }

  const showEditor = isCreating || selectedNote;

  return (
    <div className="flex h-screen">
      <aside className="flex w-80 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h1 className="text-lg font-semibold">Notes</h1>
          <Button size="sm" onClick={handleNew}>
            New
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <NotesList notes={notes} selectedId={selectedId} onSelect={handleSelect} />
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-white dark:bg-black">
        {showEditor ? (
          <div className="flex-1 p-6">
            <NoteEditor
              key={selectedNote?.id ?? 'new'}
              note={isCreating ? null : selectedNote}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-500">
            {isPending ? 'Loading...' : 'Select a note or create a new one'}
          </div>
        )}
      </main>
    </div>
  );
}

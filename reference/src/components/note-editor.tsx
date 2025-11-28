'use client';

import { createNote, deleteNote, Note, updateNote } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRef, useState, useTransition } from 'react';

interface NoteEditorProps {
  note: Note | null;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function NoteEditor({ note, onSave, onDelete, onCancel }: NoteEditorProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const isNew = !note;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isNew
        ? await createNote(formData)
        : await updateNote(note.id, formData);

      if ('error' in result && result.error) {
        setErrors(result.error);
      } else {
        setErrors({});
        onSave();
      }
    });
  }

  async function handleDelete() {
    if (!note) return;
    if (!confirm('Are you sure you want to delete this note?')) return;

    startTransition(async () => {
      await deleteNote(note.id);
      onDelete();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={note?.title ?? ''}
          placeholder="Note title"
          disabled={isPending}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title[0]}</p>}
      </div>

      <div className="flex flex-1 flex-col space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={note?.content ?? ''}
          placeholder="Write your note..."
          className="flex-1 resize-none"
          disabled={isPending}
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content[0]}</p>}
      </div>

      <div className="flex justify-between gap-2">
        <div>
          {!isNew && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
}

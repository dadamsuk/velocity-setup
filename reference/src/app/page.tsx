import { getNotes } from './actions';
import { NotesApp } from '@/components/notes-app';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let notes;
  try {
    notes = await getNotes();
  } catch {
    notes = [];
  }

  return <NotesApp initialNotes={notes} />;
}

import { getNotes } from './actions';
import { NotesApp } from '@/components/notes-app';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const notes = await getNotes();

  return <NotesApp initialNotes={notes} />;
}

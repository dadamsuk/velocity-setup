'use server';

import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().max(10000),
});

export type Note = typeof notes.$inferSelect;

export async function getNotes() {
  return db.select().from(notes).orderBy(notes.createdAt);
}

export async function getNote(id: string) {
  const result = await db.select().from(notes).where(eq(notes.id, id));
  return result[0] ?? null;
}

export async function createNote(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  const validated = noteSchema.safeParse({ title, content });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db.insert(notes).values({
    title: validated.data.title,
    content: validated.data.content,
  });

  revalidatePath('/');
  return { success: true };
}

export async function updateNote(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  const validated = noteSchema.safeParse({ title, content });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db
    .update(notes)
    .set({
      title: validated.data.title,
      content: validated.data.content,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, id));

  revalidatePath('/');
  return { success: true };
}

export async function deleteNote(id: string) {
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath('/');
  return { success: true };
}

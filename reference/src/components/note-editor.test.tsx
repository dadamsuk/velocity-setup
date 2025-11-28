import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoteEditor } from './note-editor';
import { Note } from '@/app/actions';

vi.mock('@/app/actions', () => ({
  createNote: vi.fn().mockResolvedValue({ success: true }),
  updateNote: vi.fn().mockResolvedValue({ success: true }),
  deleteNote: vi.fn().mockResolvedValue({ success: true }),
}));

const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: 'Test content',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('NoteEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('new note mode', () => {
    it('renders empty title input', () => {
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      const titleInput = container.querySelector('[data-slot="input"]') as HTMLInputElement;
      expect(titleInput).toBeInTheDocument();
      expect(titleInput.value).toBe('');
    });

    it('renders empty content textarea', () => {
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      const contentInput = container.querySelector('[data-slot="textarea"]') as HTMLTextAreaElement;
      expect(contentInput).toBeInTheDocument();
      expect(contentInput.value).toBe('');
    });

    it('shows Create submit button', () => {
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton?.textContent).toBe('Create');
    });

    it('does not show Delete button', () => {
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      const buttons = container.querySelectorAll('button');
      const deleteButton = Array.from(buttons).find((b) => b.textContent === 'Delete');
      expect(deleteButton).toBeUndefined();
    });
  });

  describe('edit note mode', () => {
    it('renders title with note value', () => {
      const { container } = render(
        <NoteEditor
          key={mockNote.id}
          note={mockNote}
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const titleInput = container.querySelector('[data-slot="input"]') as HTMLInputElement;
      expect(titleInput.value).toBe('Test Note');
    });

    it('renders content with note value', () => {
      const { container } = render(
        <NoteEditor
          key={mockNote.id}
          note={mockNote}
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const contentInput = container.querySelector('[data-slot="textarea"]') as HTMLTextAreaElement;
      expect(contentInput.value).toBe('Test content');
    });

    it('shows Save submit button', () => {
      const { container } = render(
        <NoteEditor
          key={mockNote.id}
          note={mockNote}
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton?.textContent).toBe('Save');
    });

    it('shows Delete button', () => {
      const { container } = render(
        <NoteEditor
          key={mockNote.id}
          note={mockNote}
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const buttons = container.querySelectorAll('button');
      const deleteButton = Array.from(buttons).find((b) => b.textContent === 'Delete');
      expect(deleteButton).toBeDefined();
    });
  });

  describe('interactions', () => {
    it('calls onCancel when Cancel button is clicked', () => {
      const onCancel = vi.fn();
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={onCancel} />
      );

      const buttons = container.querySelectorAll('button');
      const cancelButton = Array.from(buttons).find((b) => b.textContent === 'Cancel');
      fireEvent.click(cancelButton!);

      expect(onCancel).toHaveBeenCalled();
    });

    it('allows typing in title field', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      const titleInput = container.querySelector('[data-slot="input"]') as HTMLInputElement;
      await user.type(titleInput, 'New Title');

      expect(titleInput.value).toBe('New Title');
    });

    it('allows typing in content field', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      const contentInput = container.querySelector('[data-slot="textarea"]') as HTMLTextAreaElement;
      await user.type(contentInput, 'New Content');

      expect(contentInput.value).toBe('New Content');
    });
  });

  describe('form structure', () => {
    it('has form element', () => {
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('has title label', () => {
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      const label = container.querySelector('label[for="title"]');
      expect(label?.textContent).toBe('Title');
    });

    it('has content label', () => {
      const { container } = render(
        <NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} onCancel={vi.fn()} />
      );

      const label = container.querySelector('label[for="content"]');
      expect(label?.textContent).toBe('Content');
    });
  });
});

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotesApp } from './notes-app';
import { Note } from '@/app/actions';

vi.mock('@/app/actions', () => ({
  getNotes: vi.fn().mockResolvedValue([]),
  getNote: vi.fn().mockResolvedValue(null),
  createNote: vi.fn().mockResolvedValue({ success: true }),
  updateNote: vi.fn().mockResolvedValue({ success: true }),
  deleteNote: vi.fn().mockResolvedValue({ success: true }),
}));

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'First Note',
    content: 'Content of first note',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Second Note',
    content: 'Content of second note',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

describe('NotesApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('layout', () => {
    it('renders the header with title', () => {
      const { container } = render(<NotesApp initialNotes={[]} />);

      const heading = container.querySelector('h1');
      expect(heading?.textContent).toBe('Notes');
    });

    it('renders the New button in header', () => {
      const { container } = render(<NotesApp initialNotes={[]} />);

      const header = container.querySelector('aside > div:first-child');
      const newButton = header?.querySelector('button');
      expect(newButton?.textContent).toBe('New');
    });

    it('renders sidebar and main areas', () => {
      const { container } = render(<NotesApp initialNotes={[]} />);

      expect(container.querySelector('aside')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state message when no notes', () => {
      const { container } = render(<NotesApp initialNotes={[]} />);

      const aside = container.querySelector('aside');
      expect(aside?.textContent).toContain('No notes yet');
    });
  });

  describe('with notes', () => {
    it('renders the list of notes', () => {
      const { container } = render(<NotesApp initialNotes={mockNotes} />);

      const titles = container.querySelectorAll('[data-slot="card-title"]');
      expect(titles).toHaveLength(2);
      expect(titles[0].textContent).toBe('First Note');
      expect(titles[1].textContent).toBe('Second Note');
    });

    it('shows placeholder in main area when no note selected', () => {
      const { container } = render(<NotesApp initialNotes={mockNotes} />);

      const main = container.querySelector('main');
      expect(main?.textContent).toContain('Select a note or create a new one');
    });
  });

  describe('creating notes', () => {
    it('opens editor when New button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<NotesApp initialNotes={[]} />);

      const header = container.querySelector('aside > div:first-child');
      const newButton = header?.querySelector('button');
      await user.click(newButton!);

      await waitFor(() => {
        expect(container.querySelector('[data-slot="input"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="textarea"]')).toBeInTheDocument();
      });
    });

    it('shows Create button in new note editor', async () => {
      const user = userEvent.setup();
      const { container } = render(<NotesApp initialNotes={[]} />);

      const header = container.querySelector('aside > div:first-child');
      const newButton = header?.querySelector('button');
      await user.click(newButton!);

      await waitFor(() => {
        const submitButton = container.querySelector('button[type="submit"]');
        expect(submitButton?.textContent).toBe('Create');
      });
    });

    it('closes editor when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<NotesApp initialNotes={[]} />);

      const header = container.querySelector('aside > div:first-child');
      const newButton = header?.querySelector('button');
      await user.click(newButton!);

      await waitFor(() => {
        expect(container.querySelector('[data-slot="input"]')).toBeInTheDocument();
      });

      const mainButtons = container.querySelectorAll('main button');
      const cancelButton = Array.from(mainButtons).find((b) => b.textContent === 'Cancel');
      await user.click(cancelButton!);

      await waitFor(() => {
        expect(container.querySelector('[data-slot="input"]')).not.toBeInTheDocument();
      });
    });
  });

  describe('note count', () => {
    it('displays correct number of notes', () => {
      const { container } = render(<NotesApp initialNotes={mockNotes} />);

      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards).toHaveLength(2);
    });
  });
});

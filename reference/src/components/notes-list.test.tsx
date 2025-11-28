import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotesList } from './notes-list';
import { Note } from '@/app/actions';

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

describe('NotesList', () => {
  it('renders empty state when no notes', () => {
    render(<NotesList notes={[]} selectedId={null} onSelect={() => {}} />);

    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  it('renders note titles', () => {
    const { container } = render(
      <NotesList notes={mockNotes} selectedId={null} onSelect={() => {}} />
    );

    const titles = container.querySelectorAll('[data-slot="card-title"]');
    expect(titles).toHaveLength(2);
    expect(titles[0].textContent).toBe('First Note');
    expect(titles[1].textContent).toBe('Second Note');
  });

  it('renders note descriptions', () => {
    const { container } = render(
      <NotesList notes={mockNotes} selectedId={null} onSelect={() => {}} />
    );

    const descriptions = container.querySelectorAll('[data-slot="card-description"]');
    expect(descriptions).toHaveLength(2);
    expect(descriptions[0].textContent).toBe('Content of first note');
    expect(descriptions[1].textContent).toBe('Content of second note');
  });

  it('calls onSelect when a note card is clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <NotesList notes={mockNotes} selectedId={null} onSelect={onSelect} />
    );

    const cards = container.querySelectorAll('[data-slot="card"]');
    fireEvent.click(cards[0]);

    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('applies selected styling to selected note', () => {
    const { container } = render(
      <NotesList notes={mockNotes} selectedId="1" onSelect={() => {}} />
    );

    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards[0].className).toContain('border-zinc-900');
    expect(cards[1].className).not.toContain('border-zinc-900');
  });

  it('shows "No content" for notes with empty content', () => {
    const notesWithEmpty: Note[] = [
      {
        id: '1',
        title: 'Empty Note',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const { container } = render(
      <NotesList notes={notesWithEmpty} selectedId={null} onSelect={() => {}} />
    );

    const description = container.querySelector('[data-slot="card-description"]');
    expect(description?.textContent).toBe('No content');
  });

  it('renders correct number of note cards', () => {
    const { container } = render(
      <NotesList notes={mockNotes} selectedId={null} onSelect={() => {}} />
    );

    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards).toHaveLength(2);
  });
});

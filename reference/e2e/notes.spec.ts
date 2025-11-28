import { test, expect } from '@playwright/test';

test.describe('Notes App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays the notes app layout', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
  });

  test('shows empty state or existing notes', async ({ page }) => {
    const emptyState = page.getByText(/no notes yet|select a note/i);
    const notesList = page.locator('aside');

    await expect(notesList).toBeVisible();
    // Either shows empty state or has notes
    const hasNotes = await page.locator('aside').locator('[class*="cursor-pointer"]').count();
    if (hasNotes === 0) {
      await expect(page.getByText(/no notes yet/i)).toBeVisible();
    }
  });

  test('opens new note editor when clicking New button', async ({ page }) => {
    await page.getByRole('button', { name: 'New' }).click();

    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Content')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('closes editor when clicking Cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'New' }).click();
    await expect(page.getByLabel('Title')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByLabel('Title')).not.toBeVisible();
    await expect(page.getByText(/select a note or create a new one/i)).toBeVisible();
  });

  test('can type in the note form fields', async ({ page }) => {
    await page.getByRole('button', { name: 'New' }).click();

    await page.getByLabel('Title').fill('My Test Note');
    await page.getByLabel('Content').fill('This is the content of my test note.');

    await expect(page.getByLabel('Title')).toHaveValue('My Test Note');
    await expect(page.getByLabel('Content')).toHaveValue('This is the content of my test note.');
  });

  test('creates a new note', async ({ page }) => {
    const noteTitle = `Test Note ${Date.now()}`;

    await page.getByRole('button', { name: 'New' }).click();
    await page.getByLabel('Title').fill(noteTitle);
    await page.getByLabel('Content').fill('Test content for the new note');
    await page.getByRole('button', { name: 'Create' }).click();

    // Should close the editor and show the new note in the list
    await expect(page.getByText(noteTitle)).toBeVisible();
  });

  test('selects a note from the list', async ({ page }) => {
    // First create a note
    const noteTitle = `Selectable Note ${Date.now()}`;
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByLabel('Title').fill(noteTitle);
    await page.getByLabel('Content').fill('Content to select');
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for note to appear in list
    await expect(page.getByText(noteTitle)).toBeVisible();

    // Click the note to select it
    await page.getByText(noteTitle).click();

    // Should open editor with note data
    await expect(page.getByLabel('Title')).toHaveValue(noteTitle);
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('edits an existing note', async ({ page }) => {
    // First create a note
    const originalTitle = `Original Title ${Date.now()}`;
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByLabel('Title').fill(originalTitle);
    await page.getByLabel('Content').fill('Original content');
    await page.getByRole('button', { name: 'Create' }).click();

    // Select the note
    await page.getByText(originalTitle).click();
    await expect(page.getByLabel('Title')).toHaveValue(originalTitle);

    // Edit the note
    const updatedTitle = `Updated Title ${Date.now()}`;
    await page.getByLabel('Title').clear();
    await page.getByLabel('Title').fill(updatedTitle);
    await page.getByRole('button', { name: 'Save' }).click();

    // Should show updated title in list
    await expect(page.getByText(updatedTitle)).toBeVisible();
  });

  test('deletes a note', async ({ page }) => {
    // First create a note
    const noteTitle = `Delete Me ${Date.now()}`;
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByLabel('Title').fill(noteTitle);
    await page.getByLabel('Content').fill('This will be deleted');
    await page.getByRole('button', { name: 'Create' }).click();

    // Select the note
    await page.getByText(noteTitle).click();

    // Handle the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Delete the note
    await page.getByRole('button', { name: 'Delete' }).click();

    // Note should no longer be in the list
    await expect(page.getByText(noteTitle)).not.toBeVisible();
  });

  test('shows validation error for empty title', async ({ page }) => {
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByLabel('Content').fill('Content without title');
    await page.getByRole('button', { name: 'Create' }).click();

    // Should show error message
    await expect(page.getByText(/title is required/i)).toBeVisible();
  });
});

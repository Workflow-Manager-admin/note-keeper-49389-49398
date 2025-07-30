import React, { useState, useRef } from 'react';
import './App.css';

/**
 * Notes App - Minimalistic web notes frontend.
 * Features: Create, edit, delete, and list all notes.
 * Layout: Header (app title), sidebar (notes list), main area (note edit/create).
 * Theme: Light, minimalistic. Colors: primary #0057d8, accent #ffb300, secondary #ececec
 */

// PUBLIC_INTERFACE
function App() {
  // Notes data: {id, title, body}
  const [notes, setNotes] = useState([
    // Start with one dummy note for demonstration
    { id: 1, title: "Example Note", body: "Welcome to Notes! Select or create a note to begin editing." }
  ]);
  // Currently selected note ID for editing; null if creating new
  const [selectedNoteId, setSelectedNoteId] = useState(notes[0].id);
  // Form state for title & body
  const [noteForm, setNoteForm] = useState({ title: notes[0].title, body: notes[0].body });
  // Track if creating a new note
  const [isCreating, setIsCreating] = useState(false);

  // Used for generating unique note IDs (in a real app, this would come from DB/backend)
  const nextNoteId = useRef(2);

  // Select a note to edit from sidebar
  // PUBLIC_INTERFACE
  function handleSelectNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    setSelectedNoteId(noteId);
    setIsCreating(false);
    setNoteForm({ title: note.title, body: note.body });
  }

  // Start creating a new note
  // PUBLIC_INTERFACE
  function handleCreateNewNote() {
    setSelectedNoteId(null);
    setIsCreating(true);
    setNoteForm({ title: '', body: '' });
  }

  // Handle form changes
  function handleChange(e) {
    const { name, value } = e.target;
    setNoteForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  // Save (create or update) a note
  // PUBLIC_INTERFACE
  function handleSaveNote(e) {
    e.preventDefault();

    const title = noteForm.title.trim();
    const body = noteForm.body.trim();
    if (!title) {
      alert('Please enter a note title.');
      return;
    }

    if (isCreating) {
      // Add new note
      const newNote = {
        id: nextNoteId.current++,
        title,
        body,
      };
      setNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
      setIsCreating(false);
      setNoteForm({ title, body });
    } else if (selectedNoteId !== null) {
      // Update existing
      setNotes(notes.map(n =>
        n.id === selectedNoteId
          ? { ...n, title, body }
          : n
      ));
    }
  }

  // Delete a note
  // PUBLIC_INTERFACE
  function handleDeleteNote(deleteId) {
    if (window.confirm("Delete note? This cannot be undone.")) {
      const idx = notes.findIndex(n => n.id === deleteId);
      // Remove note from array
      const filtered = notes.filter(n => n.id !== deleteId);
      setNotes(filtered);
      // If the deleted was active, choose next, or create new if none left
      if (selectedNoteId === deleteId) {
        if (filtered.length) {
          const newActive = filtered[0].id;
          handleSelectNote(newActive);
        } else {
          setIsCreating(true);
          setSelectedNoteId(null);
          setNoteForm({ title: '', body: '' });
        }
      }
    }
  }

  // Find the note currently being edited
  const activeNote = isCreating
    ? null
    : notes.find(n => n.id === selectedNoteId);

  return (
    <div className="notes-app">
      <Header />

      <div className="notes-main-layout">
        <Sidebar
          notes={notes}
          selectedId={selectedNoteId}
          onSelect={handleSelectNote}
          onCreateNew={handleCreateNewNote}
          onDelete={handleDeleteNote}
        />

        <main className="main-area">
          <NoteEditor
            isCreating={isCreating}
            note={activeNote}
            noteForm={noteForm}
            onChange={handleChange}
            onSave={handleSaveNote}
          />
        </main>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function Header() {
  return (
    <header className="header">
      <span className="app-title">📝 Notes</span>
    </header>
  );
}

// PUBLIC_INTERFACE
function Sidebar({ notes, selectedId, onSelect, onCreateNew, onDelete }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="btn btn-accent" onClick={onCreateNew} title="Create new note">
          ＋ New
        </button>
      </div>
      <nav className="note-list">
        {notes.length === 0 && (
          <div className="sidebar-empty">No notes yet</div>
        )}
        {notes.map(note => (
          <div
            key={note.id}
            className={`note-list-item${selectedId === note.id ? " selected" : ""}`}
            onClick={() => onSelect(note.id)}
            tabIndex={0}
            aria-label={`Edit note: ${note.title}`}
          >
            <span className="note-title">{note.title === '' ? <em>(Untitled)</em> : note.title}</span>
            <button
              className="btn btn-delete"
              title="Delete note"
              onClick={e => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              aria-label="Delete note"
            >🗑️</button>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// PUBLIC_INTERFACE
function NoteEditor({ isCreating, note, noteForm, onChange, onSave }) {
  return (
    <section className="editor-container">
      <form className="note-form" onSubmit={onSave} autoComplete="off">
        <input
          type="text"
          name="title"
          className="note-title-input"
          placeholder="Note title"
          value={noteForm.title}
          onChange={onChange}
          required
          autoFocus
        />
        <textarea
          name="body"
          className="note-body-input"
          placeholder="Start typing your note here..."
          value={noteForm.body}
          onChange={onChange}
          rows={12}
        />
        <div className="editor-actions">
          <button className="btn btn-primary" type="submit">
            {isCreating ? "Create Note" : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default App;

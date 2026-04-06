import React, { useState, useEffect } from 'react';
import '../styles/Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('hepsi');

  // localStorage'dan notları yükle
  useEffect(() => {
    const savedNotes = localStorage.getItem('teacherNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Notları localStorage'a kaydet
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('teacherNotes', JSON.stringify(notes));
    }
  }, [notes]);

  // Yeni not ekle veya düzenle
  const handleSaveNote = () => {
    if (currentNote.trim() === '') return;

    if (editingId) {
      // Mevcut notu düzenle
      setNotes(notes.map(note => 
        note.id === editingId 
          ? { ...note, content: currentNote, updatedAt: new Date().toISOString() }
          : note
      ));
      setEditingId(null);
    } else {
      // Yeni not ekle
      const newNote = {
        id: Date.now(),
        content: currentNote,
        category: 'genel',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
    }
    
    setCurrentNote('');
  };

  // Notu düzenlemeye başla
  const handleEditNote = (note) => {
    setCurrentNote(note.content);
    setEditingId(note.id);
  };

  // Notu sil
  const handleDeleteNote = (id) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem('teacherNotes', JSON.stringify(updatedNotes));
    }
  };

  // Not kategorisini değiştir
  const handleCategoryChange = (id, category) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, category } : note
    ));
  };

  // Düzenlemeyi iptal et
  const handleCancelEdit = () => {
    setCurrentNote('');
    setEditingId(null);
  };

  // Tarihi formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Bugün ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
      return 'Dün';
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  // Notları filtrele ve ara
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'hepsi' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2>📝 Not Defteri</h2>
        <p className="notes-subtitle">Günlük notlarınızı buraya yazabilirsiniz</p>
      </div>

      {/* Not Yazma Alanı */}
      <div className="note-editor">
        <textarea
          className="note-textarea"
          placeholder="Notunuzu buraya yazın..."
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          rows={6}
        />
        <div className="note-editor-actions">
          <button 
            className="btn btn-primary"
            onClick={handleSaveNote}
            disabled={currentNote.trim() === ''}
          >
            {editingId ? '✏️ Güncelle' : '💾 Kaydet'}
          </button>
          {editingId && (
            <button 
              className="btn btn-secondary"
              onClick={handleCancelEdit}
            >
              ❌ İptal
            </button>
          )}
          <span className="character-count">
            {currentNote.length} karakter
          </span>
        </div>
      </div>

      {/* Arama ve Filtreleme */}
      {notes.length > 0 && (
        <div className="notes-filters">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Notlarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="category-filters">
            <button 
              className={`filter-btn ${filterCategory === 'hepsi' ? 'active' : ''}`}
              onClick={() => setFilterCategory('hepsi')}
            >
              Hepsi ({notes.length})
            </button>
            <button 
              className={`filter-btn ${filterCategory === 'genel' ? 'active' : ''}`}
              onClick={() => setFilterCategory('genel')}
            >
              Genel ({notes.filter(n => n.category === 'genel').length})
            </button>
            <button 
              className={`filter-btn ${filterCategory === 'onemli' ? 'active' : ''}`}
              onClick={() => setFilterCategory('onemli')}
            >
              Önemli ({notes.filter(n => n.category === 'onemli').length})
            </button>
            <button 
              className={`filter-btn ${filterCategory === 'hatirlatma' ? 'active' : ''}`}
              onClick={() => setFilterCategory('hatirlatma')}
            >
              Hatırlatma ({notes.filter(n => n.category === 'hatirlatma').length})
            </button>
          </div>
        </div>
      )}

      {/* Notlar Listesi */}
      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            {notes.length === 0 ? (
              <>
                <span className="empty-icon">📋</span>
                <p>Henüz not eklenmemiş</p>
                <p className="empty-subtitle">İlk notunuzu yukarıdaki alana yazarak başlayın</p>
              </>
            ) : (
              <>
                <span className="empty-icon">🔍</span>
                <p>Arama kriterlerine uygun not bulunamadı</p>
              </>
            )}
          </div>
        ) : (
          filteredNotes.map(note => (
            <div key={note.id} className={`note-item category-${note.category}`}>
              <div className="note-header-row">
                <select
                  className="note-category-select"
                  value={note.category}
                  onChange={(e) => handleCategoryChange(note.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="genel">📌 Genel</option>
                  <option value="onemli">⭐ Önemli</option>
                  <option value="hatirlatma">⏰ Hatırlatma</option>
                </select>
                <span className="note-date">{formatDate(note.updatedAt)}</span>
              </div>
              <div className="note-content">
                {note.content}
              </div>
              <div className="note-actions">
                <button 
                  className="note-action-btn edit"
                  onClick={() => handleEditNote(note)}
                  title="Düzenle"
                >
                  ✏️
                </button>
                <button 
                  className="note-action-btn delete"
                  onClick={() => handleDeleteNote(note.id)}
                  title="Sil"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* İstatistikler */}
      {notes.length > 0 && (
        <div className="notes-stats">
          <div className="stat-item">
            <span className="stat-label">Toplam Not:</span>
            <span className="stat-value">{notes.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Bu Hafta:</span>
            <span className="stat-value">
              {notes.filter(note => {
                const noteDate = new Date(note.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return noteDate > weekAgo;
              }).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Önemli:</span>
            <span className="stat-value">
              {notes.filter(n => n.category === 'onemli').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
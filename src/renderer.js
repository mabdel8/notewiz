const { ipcRenderer } = require('electron');

class NoteWiz {
    constructor() {
        this.currentNote = null;
        this.currentFilePath = null;
        this.isPreviewMode = false;
        this.notes = [];
        this.unsavedChanges = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadWelcomeNote();
        this.startAutoSave();
    }

    initializeElements() {
        // Editor elements
        this.editor = document.getElementById('editor');
        this.previewContent = document.getElementById('previewContent');
        this.noteTitleInput = document.getElementById('noteTitleInput');
        
        // Toolbar elements
        this.saveBtn = document.getElementById('saveBtn');
        this.openBtn = document.getElementById('openBtn');
        this.modeToggle = document.getElementById('modeToggle');
        this.insertCodeBtn = document.getElementById('insertCodeBtn');
        this.languageSelect = document.getElementById('languageSelect');
        this.newNoteBtn = document.getElementById('newNoteBtn');
        
        // Modal elements
        this.codeModal = document.getElementById('codeModal');
        this.closeModal = document.getElementById('closeModal');
        this.codeLanguage = document.getElementById('codeLanguage');
        this.codeContent = document.getElementById('codeContent');
        this.insertCode = document.getElementById('insertCode');
        this.cancelCode = document.getElementById('cancelCode');
        
        // Container elements
        this.editorContainer = document.querySelector('.editor-container');
        this.notesList = document.getElementById('notesList');
    }

    bindEvents() {
        // Editor events
        this.editor.addEventListener('input', () => {
            this.onEditorChange();
        });

        this.noteTitleInput.addEventListener('input', () => {
            this.markUnsaved();
        });

        // Toolbar events
        this.saveBtn.addEventListener('click', () => this.saveNote());
        this.openBtn.addEventListener('click', () => this.openNote());
        this.modeToggle.addEventListener('click', () => this.togglePreviewMode());
        this.insertCodeBtn.addEventListener('click', () => this.showCodeModal());
        this.newNoteBtn.addEventListener('click', () => this.createNewNote());

        // Modal events
        this.closeModal.addEventListener('click', () => this.hideCodeModal());
        this.cancelCode.addEventListener('click', () => this.hideCodeModal());
        this.insertCode.addEventListener('click', () => this.insertCodeBlock());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveNote();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.openNote();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.createNewNote();
                        break;
                }
            }
            
            if (e.key === 'Escape' && this.codeModal.classList.contains('show')) {
                this.hideCodeModal();
            }
        });

        // IPC events from main process
        ipcRenderer.on('menu-new-note', () => this.createNewNote());
        ipcRenderer.on('menu-save-note', () => this.saveNote());
        ipcRenderer.on('menu-open-note', (event, filePath) => this.loadFile(filePath));

        // Window beforeunload
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    loadWelcomeNote() {
        this.noteTitleInput.value = 'Welcome to NoteWiz';
        this.updatePreview();
    }

    onEditorChange() {
        this.markUnsaved();
        this.updatePreview();
        this.updateNotePreview();
    }

    markUnsaved() {
        if (!this.unsavedChanges) {
            this.unsavedChanges = true;
            document.title = '• NoteWiz - Developer Notes';
        }
    }

    markSaved() {
        this.unsavedChanges = false;
        document.title = 'NoteWiz - Developer Notes';
    }

    updatePreview() {
        const markdownText = this.editor.value;
        if (markdownText.trim() === '') {
            this.previewContent.innerHTML = '<p style="color: #666; font-style: italic;">Nothing to preview yet. Start writing in the editor!</p>';
            return;
        }

        try {
            // Configure marked for code highlighting
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.warn('Highlight.js error:', err);
                        }
                    }
                    return hljs.highlightAuto(code).value;
                },
                breaks: true,
                gfm: true
            });

            const html = marked.parse(markdownText);
            this.previewContent.innerHTML = html;
        } catch (error) {
            console.error('Markdown parsing error:', error);
            this.previewContent.innerHTML = '<p style="color: #ff6b6b;">Error rendering markdown preview</p>';
        }
    }

    updateNotePreview() {
        const activeNote = document.querySelector('.note-item.active');
        if (activeNote) {
            const previewElement = activeNote.querySelector('.note-preview');
            const content = this.editor.value;
            const preview = content
                .replace(/[#*`\[\]]/g, '') // Remove markdown formatting
                .substring(0, 100)
                .trim();
            previewElement.textContent = preview || 'Empty note...';
        }
    }

    togglePreviewMode() {
        this.isPreviewMode = !this.isPreviewMode;
        
        if (this.isPreviewMode) {
            this.editorContainer.className = 'editor-container preview-only';
            this.modeToggle.textContent = '✏️ Edit';
            this.modeToggle.classList.add('active');
        } else {
            this.editorContainer.className = 'editor-container split-view';
            this.modeToggle.textContent = '👁️ Preview';
            this.modeToggle.classList.remove('active');
        }
    }

    showCodeModal() {
        this.codeModal.classList.add('show');
        this.codeContent.focus();
    }

    hideCodeModal() {
        this.codeModal.classList.remove('show');
        this.codeContent.value = '';
    }

    insertCodeBlock() {
        const language = this.codeLanguage.value;
        const code = this.codeContent.value;
        
        if (code.trim() === '') {
            alert('Please enter some code to insert.');
            return;
        }

        const codeBlock = `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        
        // Insert at cursor position
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const text = this.editor.value;
        
        this.editor.value = text.substring(0, start) + codeBlock + text.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + codeBlock.length;
        
        this.hideCodeModal();
        this.onEditorChange();
        this.editor.focus();
    }

    async saveNote() {
        try {
            let filePath = this.currentFilePath;
            
            if (!filePath) {
                const result = await ipcRenderer.invoke('show-save-dialog');
                if (result.canceled) return;
                filePath = result.filePath;
            }

            const content = this.editor.value;
            const saveResult = await ipcRenderer.invoke('save-file', filePath, content);
            
            if (saveResult.success) {
                this.currentFilePath = filePath;
                this.markSaved();
                this.showNotification('Note saved successfully!', 'success');
                this.updateNoteTitle(filePath);
            } else {
                this.showNotification('Failed to save note: ' + saveResult.error, 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            this.showNotification('Failed to save note', 'error');
        }
    }

    async openNote() {
        try {
            const result = await ipcRenderer.invoke('show-open-dialog');
            if (result.canceled) return;
            
            await this.loadFile(result.filePaths[0]);
        } catch (error) {
            console.error('Open error:', error);
            this.showNotification('Failed to open note', 'error');
        }
    }

    async loadFile(filePath) {
        try {
            const result = await ipcRenderer.invoke('read-file', filePath);
            
            if (result.success) {
                this.editor.value = result.content;
                this.currentFilePath = filePath;
                this.markSaved();
                this.updatePreview();
                this.updateNoteTitle(filePath);
                this.addToNotesList(filePath, result.content);
                this.showNotification('Note loaded successfully!', 'success');
            } else {
                this.showNotification('Failed to load note: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Load error:', error);
            this.showNotification('Failed to load note', 'error');
        }
    }

    updateNoteTitle(filePath) {
        const fileName = filePath.split(/[\\/]/).pop().replace(/\.[^/.]+$/, '');
        this.noteTitleInput.value = fileName;
    }

    addToNotesList(filePath, content) {
        const fileName = filePath.split(/[\\/]/).pop().replace(/\.[^/.]+$/, '');
        const preview = content.replace(/[#*`\[\]]/g, '').substring(0, 100).trim() || 'Empty note...';
        
        // Remove existing note if it exists
        const existingNote = document.querySelector(`[data-file-path="${filePath}"]`);
        if (existingNote) {
            existingNote.remove();
        }

        // Remove active class from all notes
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });

        const noteItem = document.createElement('div');
        noteItem.className = 'note-item active';
        noteItem.setAttribute('data-file-path', filePath);
        noteItem.innerHTML = `
            <div class="note-title">${fileName}</div>
            <div class="note-preview">${preview}</div>
        `;

        noteItem.addEventListener('click', () => {
            this.loadFile(filePath);
            document.querySelectorAll('.note-item').forEach(item => {
                item.classList.remove('active');
            });
            noteItem.classList.add('active');
        });

        this.notesList.insertBefore(noteItem, this.notesList.firstChild);
    }

    createNewNote() {
        // Remove active class from all notes
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });

        this.editor.value = '';
        this.noteTitleInput.value = 'Untitled Note';
        this.currentFilePath = null;
        this.updatePreview();
        this.markUnsaved();
        this.editor.focus();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    startAutoSave() {
        setInterval(() => {
            if (this.unsavedChanges && this.currentFilePath) {
                this.saveNote();
            }
        }, 30000); // Auto-save every 30 seconds
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.noteWiz = new NoteWiz();
});

// Configure highlight.js
if (typeof hljs !== 'undefined') {
    hljs.configure({
        languages: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'json', 'sql', 'bash', 'markdown']
    });
} 
const { ipcRenderer } = require('electron');

class NoteWiz {
    constructor() {
        this.currentNote = null;
        this.currentFilePath = null;
        this.isPreviewMode = false;
        this.notes = [];
        this.unsavedChanges = false;
        this.recentFiles = this.loadRecentFiles();
        
        this.initializeElements();
        this.bindEvents();
        this.loadWelcomeNote();
        this.loadRecentFilesUI();
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
        
        // Slash command elements
        this.slashMenu = document.getElementById('slashMenu');
        this.inlineCodeEditor = document.getElementById('inlineCodeEditor');
        this.inlineCodeLanguage = document.getElementById('inlineCodeLanguage');
        this.inlineCodeTextarea = document.getElementById('inlineCodeTextarea');
        this.saveInlineCode = document.getElementById('saveInlineCode');
        this.cancelInlineCode = document.getElementById('cancelInlineCode');
        
        // Container elements
        this.editorContainer = document.querySelector('.editor-container');
        this.notesList = document.getElementById('notesList');
        
        // Slash command state
        this.slashMenuVisible = false;
        this.selectedSlashItem = 0;
        this.slashPosition = { x: 0, y: 0 };
        this.slashStartPos = -1;
    }

    bindEvents() {
        // Editor events
        this.editor.addEventListener('input', (e) => {
            this.onEditorChange();
            this.handleSlashCommand(e);
        });

        this.editor.addEventListener('keydown', (e) => {
            this.handleEditorKeydown(e);
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

        // Slash command events
        this.slashMenu.addEventListener('click', (e) => this.handleSlashMenuClick(e));
        
        // Inline code editor events
        this.saveInlineCode.addEventListener('click', () => this.saveInlineCodeBlock());
        this.cancelInlineCode.addEventListener('click', () => this.hideInlineCodeEditor());

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
            // Check if marked is available
            if (typeof marked === 'undefined') {
                throw new Error('Marked library not loaded');
            }

            // Configure marked for code highlighting
            const renderer = new marked.Renderer();
            
            // Custom code block renderer
            renderer.code = function(code, language) {
                const validLanguage = language && hljs.getLanguage(language) ? language : '';
                const highlighted = validLanguage 
                    ? hljs.highlight(code, { language: validLanguage }).value
                    : hljs.highlightAuto(code).value;
                
                return `<pre><code class="hljs ${validLanguage ? `language-${validLanguage}` : ''}">${highlighted}</code></pre>`;
            };

            // Configure marked options
            marked.use({
                renderer: renderer,
                highlight: function(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.warn('Highlight.js error:', err);
                            return hljs.highlightAuto(code).value;
                        }
                    }
                    return hljs.highlightAuto(code).value;
                },
                breaks: true,
                gfm: true,
                headerIds: false,
                mangle: false
            });

            const html = marked.parse(markdownText);
            this.previewContent.innerHTML = html;
            
        } catch (error) {
            console.error('Markdown parsing error:', error);
            console.error('Error details:', error.message);
            this.previewContent.innerHTML = `<p style="color: #ff6b6b;">Error rendering markdown preview: ${error.message}</p>`;
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
                this.addToRecentFiles(filePath, content);
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
            if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;
            
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
                this.addToRecentFiles(filePath, result.content);
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

    loadRecentFiles() {
        try {
            const stored = localStorage.getItem('notewiz-recent-files');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recent files:', error);
            return [];
        }
    }

    saveRecentFiles() {
        try {
            localStorage.setItem('notewiz-recent-files', JSON.stringify(this.recentFiles));
        } catch (error) {
            console.error('Error saving recent files:', error);
        }
    }

    addToRecentFiles(filePath, content = '') {
        if (!filePath) return;

        // Remove if already exists
        this.recentFiles = this.recentFiles.filter(file => file.path !== filePath);
        
        // Add to beginning
        const fileName = filePath.split(/[\\/]/).pop().replace(/\.[^/.]+$/, '');
        const preview = content.replace(/[#*`\[\]]/g, '').substring(0, 100).trim() || 'Empty note...';
        
        this.recentFiles.unshift({
            path: filePath,
            name: fileName,
            preview: preview,
            lastOpened: new Date().toISOString()
        });

        // Keep only last 10 files
        this.recentFiles = this.recentFiles.slice(0, 10);
        
        this.saveRecentFiles();
        this.loadRecentFilesUI();
    }

    loadRecentFilesUI() {
        // Clear existing notes except welcome
        const welcomeNote = document.querySelector('.note-item[data-note-id="welcome"]');
        this.notesList.innerHTML = '';
        
        if (welcomeNote) {
            this.notesList.appendChild(welcomeNote);
        }

        // Add recent files
        this.recentFiles.forEach(file => {
            this.addNoteToUI(file.path, file.name, file.preview, false);
        });
    }

    addNoteToUI(filePath, fileName, preview, makeActive = true) {
        // Remove existing note if it exists
        const existingNote = document.querySelector(`[data-file-path="${filePath}"]`);
        if (existingNote) {
            existingNote.remove();
        }

        if (makeActive) {
            // Remove active class from all notes
            document.querySelectorAll('.note-item').forEach(item => {
                item.classList.remove('active');
            });
        }

        const noteItem = document.createElement('div');
        noteItem.className = `note-item ${makeActive ? 'active' : ''}`;
        noteItem.setAttribute('data-file-path', filePath);
        noteItem.innerHTML = `
            <div class="note-title">${fileName}</div>
            <div class="note-preview">${preview}</div>
            <div class="note-actions">
                <button class="remove-note-btn" title="Remove from recent">×</button>
            </div>
        `;

        noteItem.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-note-btn')) {
                e.stopPropagation();
                this.removeFromRecentFiles(filePath);
                return;
            }
            
            this.loadFile(filePath);
            document.querySelectorAll('.note-item').forEach(item => {
                item.classList.remove('active');
            });
            noteItem.classList.add('active');
        });

        // Insert after welcome note if it exists, otherwise at the beginning
        const welcomeNote = document.querySelector('.note-item[data-note-id="welcome"]');
        if (welcomeNote && makeActive) {
            this.notesList.insertBefore(noteItem, welcomeNote.nextSibling);
        } else if (makeActive) {
            this.notesList.insertBefore(noteItem, this.notesList.firstChild);
        } else {
            this.notesList.appendChild(noteItem);
        }
    }

    removeFromRecentFiles(filePath) {
        this.recentFiles = this.recentFiles.filter(file => file.path !== filePath);
        this.saveRecentFiles();
        this.loadRecentFilesUI();
    }

    // Slash Command Methods
    handleSlashCommand(e) {
        const text = this.editor.value;
        const cursorPos = this.editor.selectionStart;
        
        // Check if user typed "/"
        if (e.inputType === 'insertText' && e.data === '/') {
            // Check if "/" is at beginning of line or after whitespace
            const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
            const textBeforeCursor = text.substring(lineStart, cursorPos - 1);
            
            if (textBeforeCursor.trim() === '') {
                this.showSlashMenu(cursorPos - 1);
                return;
            }
        }
        
        // Hide slash menu if it's visible and conditions aren't met
        if (this.slashMenuVisible) {
            const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
            const lineText = text.substring(lineStart, cursorPos);
            
            if (!lineText.startsWith('/') || lineText.includes(' ')) {
                this.hideSlashMenu();
            }
        }
    }

    handleEditorKeydown(e) {
        if (this.slashMenuVisible) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateSlashMenu(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateSlashMenu(-1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.executeSlashCommand();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.hideSlashMenu();
                    break;
            }
            return;
        }

        // Other keyboard shortcuts for inline code editor
        if (this.inlineCodeEditor.classList.contains('show')) {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.hideInlineCodeEditor();
            }
            // Let Ctrl+S work even in inline editor
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveInlineCodeBlock();
            }
        }
    }

    showSlashMenu(position) {
        this.slashStartPos = position;
        this.slashMenuVisible = true;
        this.selectedSlashItem = 0;
        
        // Position the menu near the cursor
        const editorRect = this.editor.getBoundingClientRect();
        const coords = this.getTextareaCoordinates(this.editor, position);
        
        this.slashMenu.style.left = `${editorRect.left + coords.x}px`;
        this.slashMenu.style.top = `${editorRect.top + coords.y + 25}px`;
        this.slashMenu.classList.add('show');
        
        this.updateSlashMenuSelection();
    }

    hideSlashMenu() {
        this.slashMenuVisible = false;
        this.slashMenu.classList.remove('show');
        this.slashStartPos = -1;
    }

    navigateSlashMenu(direction) {
        const items = this.slashMenu.querySelectorAll('.slash-menu-item');
        this.selectedSlashItem = Math.max(0, Math.min(items.length - 1, this.selectedSlashItem + direction));
        this.updateSlashMenuSelection();
    }

    updateSlashMenuSelection() {
        const items = this.slashMenu.querySelectorAll('.slash-menu-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSlashItem);
        });
    }

    handleSlashMenuClick(e) {
        const item = e.target.closest('.slash-menu-item');
        if (item) {
            const command = item.getAttribute('data-command');
            this.executeSlashCommandByName(command);
        }
    }

    executeSlashCommand() {
        const items = this.slashMenu.querySelectorAll('.slash-menu-item');
        const selectedItem = items[this.selectedSlashItem];
        if (selectedItem) {
            const command = selectedItem.getAttribute('data-command');
            this.executeSlashCommandByName(command);
        }
    }

    executeSlashCommandByName(command) {
        this.hideSlashMenu();
        
        // Remove the "/" character
        const text = this.editor.value;
        const beforeSlash = text.substring(0, this.slashStartPos);
        const afterSlash = text.substring(this.slashStartPos + 1);
        this.editor.value = beforeSlash + afterSlash;
        this.editor.selectionStart = this.editor.selectionEnd = this.slashStartPos;

        switch (command) {
            case 'code':
                this.showInlineCodeEditor();
                break;
            case 'heading':
                this.insertText('# ');
                break;
            case 'list':
                this.insertText('- ');
                break;
            case 'table':
                this.insertTable();
                break;
        }
        
        this.onEditorChange();
    }

    showInlineCodeEditor() {
        // Position the inline code editor
        const editorRect = this.editor.getBoundingClientRect();
        const centerX = editorRect.left + editorRect.width / 2;
        const centerY = editorRect.top + editorRect.height / 2;
        
        this.inlineCodeEditor.style.left = `${centerX - 250}px`;
        this.inlineCodeEditor.style.top = `${centerY - 150}px`;
        this.inlineCodeEditor.classList.add('show');
        
        // Focus the textarea
        setTimeout(() => {
            this.inlineCodeTextarea.focus();
        }, 100);
    }

    hideInlineCodeEditor() {
        this.inlineCodeEditor.classList.remove('show');
        this.inlineCodeTextarea.value = '';
        this.editor.focus();
    }

    saveInlineCodeBlock() {
        const language = this.inlineCodeLanguage.value;
        const code = this.inlineCodeTextarea.value;
        
        if (code.trim()) {
            const codeBlock = `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
            this.insertText(codeBlock);
        }
        
        this.hideInlineCodeEditor();
    }

    insertText(text) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const currentText = this.editor.value;
        
        this.editor.value = currentText.substring(0, start) + text + currentText.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + text.length;
        this.editor.focus();
    }

    insertTable() {
        const table = `\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n`;
        this.insertText(table);
    }

    // Helper method to get textarea cursor coordinates
    getTextareaCoordinates(textarea, position) {
        const div = document.createElement('div');
        const span = document.createElement('span');
        
        const computed = window.getComputedStyle(textarea);
        div.style.cssText = computed.cssText;
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.height = 'auto';
        div.style.width = textarea.clientWidth + 'px';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        
        const textContent = textarea.value.substring(0, position);
        div.textContent = textContent;
        span.textContent = '|';
        div.appendChild(span);
        
        document.body.appendChild(div);
        const { offsetLeft: x, offsetTop: y } = span;
        document.body.removeChild(div);
        
        return { x, y };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.noteWiz = new NoteWiz();
});

// Configure highlight.js
if (typeof hljs !== 'undefined') {
    hljs.configure({
        classPrefix: 'hljs-',
        languages: ['javascript', 'python', 'java', 'cpp', 'c', 'html', 'css', 'json', 'sql', 'bash', 'shell', 'markdown', 'xml', 'typescript', 'go', 'rust', 'php']
    });
    
    // Register common language aliases
    hljs.registerAliases(['js'], { languageName: 'javascript' });
    hljs.registerAliases(['ts'], { languageName: 'typescript' });
    hljs.registerAliases(['py'], { languageName: 'python' });
    hljs.registerAliases(['sh'], { languageName: 'bash' });
    hljs.registerAliases(['c++', 'cxx'], { languageName: 'cpp' });
} 
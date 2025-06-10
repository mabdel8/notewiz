# NoteWiz 📝

A powerful note-taking application designed specifically for software engineers, built with Electron. NoteWiz combines the simplicity of markdown with robust code editing capabilities, making it perfect for documenting code, creating technical notes, and managing development knowledge.

## 🚀 Features

- **Code-First Design**: Built specifically for developers with coding in mind
- **Syntax Highlighting**: Full syntax highlighting for 10+ programming languages
- **Markdown Support**: Complete markdown rendering with GitHub-flavored markdown
- **Split View**: Edit and preview side-by-side
- **Code Block Insertion**: Quick insert code blocks with language-specific highlighting
- **File Management**: Save, open, and organize your notes efficiently
- **Auto-Save**: Automatic saving every 30 seconds to prevent data loss
- **Dark Theme**: Developer-friendly dark interface
- **Keyboard Shortcuts**: Fast workflow with common shortcuts
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🛠️ Supported Languages

- JavaScript
- Python
- Java
- C++
- HTML/CSS
- JSON
- SQL
- Bash/Shell
- Markdown
- And more...

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

### Development Mode
To run with developer tools enabled:
```bash
npm run dev
```

### Building for Distribution
To build the app for your platform:
```bash
npm run build
```

## 🎯 Usage

### Getting Started
1. Launch NoteWiz
2. Start typing in the editor pane
3. See your markdown rendered in real-time in the preview pane
4. Use the toolbar buttons to save, open, or create new notes

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - New note
- `Ctrl/Cmd + O` - Open note
- `Ctrl/Cmd + S` - Save note
- `Escape` - Close modals

### Inserting Code Blocks
1. Click the "💻 Code" button in the toolbar
2. Select your programming language
3. Enter your code
4. Click "Insert Code" to add it to your note

### Features Overview

#### Split View Editor
- **Left Pane**: Markdown editor with syntax highlighting
- **Right Pane**: Live preview of rendered content
- **Toggle Mode**: Switch between edit-only, preview-only, or split view

#### Sidebar Navigation
- View all your notes in one place
- Quick access to recently opened files
- Note previews for easy identification

#### Code Highlighting
All code blocks are automatically highlighted using highlight.js with support for:
- JavaScript, Python, Java, C++
- HTML, CSS, JSON
- SQL, Bash, and more

## 🎨 UI Features

### Modern Developer Interface
- **Dark Theme**: Easy on the eyes for long coding sessions
- **Clean Layout**: Distraction-free writing environment
- **Responsive Design**: Works well on different screen sizes
- **Professional Typography**: Code-friendly fonts for better readability

### Toolbar Features
- **Save/Open**: File operations with native dialogs
- **Preview Toggle**: Switch between edit and preview modes
- **Code Insertion**: Quick code block insertion with language selection
- **Title Editing**: Rename notes inline

## 📝 Markdown Support

NoteWiz supports full GitHub-flavored markdown including:

- Headers (H1-H6)
- **Bold** and *italic* text
- `inline code`
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Links and images
- Tables
- Blockquotes
- And more...

### Example Code Block
```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55
```

## 🔧 Technical Details

### Built With
- **Electron**: Cross-platform desktop app framework
- **CodeMirror**: Advanced code editor component
- **Marked**: Fast markdown parser
- **Highlight.js**: Syntax highlighting library
- **Native APIs**: File system operations

### Architecture
- **Main Process**: Electron main process handles app lifecycle and native operations
- **Renderer Process**: UI and editor functionality
- **IPC Communication**: Secure communication between processes

### File Structure
```
notewiz/
├── src/
│   ├── main.js          # Electron main process
│   ├── index.html       # Main UI template
│   ├── styles.css       # Application styles
│   └── renderer.js      # UI logic and functionality
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🚀 Future Enhancements

- [ ] Plugin system for custom languages
- [ ] Note linking and backlinking
- [ ] Export to PDF/HTML
- [ ] Note search and filtering
- [ ] Tag system for organization
- [ ] Collaborative editing
- [ ] Cloud sync integration
- [ ] Custom themes
- [ ] Note templates

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Bug Reports**: Found a bug? Please create an issue
2. **Feature Requests**: Have an idea? Let us know
3. **Code Contributions**: Submit pull requests
4. **Documentation**: Help improve the docs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Electron team for the amazing framework
- CodeMirror for the excellent editor component
- Highlight.js for syntax highlighting
- All the developers who make open source possible

---

**Happy coding with NoteWiz!** 💻✨

For support or questions, please create an issue in the repository. 
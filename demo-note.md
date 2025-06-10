# Welcome to NoteWiz! 🚀

This is a demonstration note that showcases the powerful features of NoteWiz, the note-taking app designed specifically for software engineers.

## Features Showcase

### 1. Markdown Support ✍️

NoteWiz supports **full markdown syntax** including:

- **Bold text** and *italic text*
- `inline code snippets`
- [Links to documentation](https://github.com)
- Lists and sublists
- Tables and more!

### 2. Code Syntax Highlighting 💻

Here are examples of different programming languages with syntax highlighting:

#### JavaScript
```javascript
// Fibonacci sequence generator
function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

const fib = fibonacci();
console.log([...Array(10)].map(() => fib.next().value));
// Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

#### Python
```python
# Quick sort implementation
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quicksort(numbers)
print("Sorted array:", sorted_numbers)
```

#### Java
```java
// Binary search implementation
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // Element not found
    }
    
    public static void main(String[] args) {
        int[] sortedArray = {2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78};
        int target = 23;
        int result = binarySearch(sortedArray, target);
        
        if (result != -1) {
            System.out.println("Element found at index: " + result);
        } else {
            System.out.println("Element not found");
        }
    }
}
```

#### SQL
```sql
-- Create a database schema for a blog application
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Query to get published posts with author information
SELECT 
    p.title,
    p.content,
    p.created_at,
    u.username as author
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.published = TRUE
ORDER BY p.created_at DESC
LIMIT 10;
```

#### Bash/Shell
```bash
#!/bin/bash
# Automated backup script

SOURCE_DIR="/home/user/documents"
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create compressed backup
echo "Starting backup of $SOURCE_DIR..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME" "$SOURCE_DIR"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_NAME"
    
    # Remove backups older than 30 days
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +30 -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi
```

### 3. Tables and Data 📊

| Language | Paradigm | Year Created | Popular Frameworks |
|----------|----------|--------------|-------------------|
| JavaScript | Multi-paradigm | 1995 | React, Vue, Angular |
| Python | Multi-paradigm | 1991 | Django, Flask, FastAPI |
| Java | Object-oriented | 1995 | Spring, Hibernate |
| C++ | Multi-paradigm | 1985 | Qt, Boost |

### 4. Code Documentation 📚

Use NoteWiz to document your code architecture, API endpoints, and development processes:

#### API Documentation Example
```http
GET /api/users/{id}
Content-Type: application/json
Authorization: Bearer {token}

Response:
{
  "id": 123,
  "username": "developer",
  "email": "dev@example.com",
  "profile": {
    "name": "John Developer",
    "role": "Senior Software Engineer"
  }
}
```

### 5. Mathematical Expressions

While not yet implemented, you can describe algorithms and complexity:

- **Time Complexity**: O(n log n) for merge sort
- **Space Complexity**: O(log n) for recursive quicksort
- **Binary Search**: O(log n) search time in sorted arrays

## Tips for Using NoteWiz 💡

1. **Keyboard Shortcuts**: Use Ctrl+S to save, Ctrl+N for new notes, Ctrl+O to open
2. **Code Blocks**: Click the "💻 Code" button to quickly insert formatted code blocks
3. **Split View**: Toggle between edit-only, preview-only, or split view modes
4. **Auto-Save**: Your work is automatically saved every 30 seconds
5. **File Organization**: Use descriptive filenames and organize notes in folders

## Perfect For: 🎯

- **Technical Documentation**: Document your projects and APIs
- **Code Snippets**: Save and organize reusable code pieces
- **Learning Notes**: Take notes while learning new technologies
- **Meeting Notes**: Record technical discussions and decisions
- **Problem Solving**: Document bugs, solutions, and troubleshooting steps
- **Architecture Notes**: Plan and document system designs

## Getting Started 🚀

1. Save this file using Ctrl+S or the Save button
2. Create a new note with Ctrl+N or the + button
3. Try inserting code blocks using the 💻 Code button
4. Toggle between edit and preview modes
5. Organize your notes in the sidebar

---

**Happy coding with NoteWiz!** 💻✨

*This demonstration note showcases just a few of the powerful features available in NoteWiz. Start creating your own notes and discover how it can improve your development workflow.* 
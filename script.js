class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    initializeElements() {
        
        this.todoForm = document.getElementById('todoForm');
        this.todoInput = document.getElementById('todoInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.dueDateInput = document.getElementById('dueDateInput');
        
        
        this.searchInput = document.getElementById('searchInput');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        
        
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasks = document.getElementById('totalTasks');
        this.activeTasks = document.getElementById('activeTasks');
        this.completedTasks = document.getElementById('completedTasks');
        
        
        this.clearCompleted = document.getElementById('clearCompleted');
        this.markAllComplete = document.getElementById('markAllComplete');
        this.themeToggle = document.getElementById('themeToggle');
        
        
        this.editModal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.editInput = document.getElementById('editInput');
        this.editPrioritySelect = document.getElementById('editPrioritySelect');
        this.editDueDateInput = document.getElementById('editDueDateInput');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEdit = document.getElementById('cancelEdit');
    }

    bindEvents() {
        
        this.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        
        
        this.searchInput.addEventListener('input', () => this.render());
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        this.sortSelect.addEventListener('change', (e) => this.handleSortChange(e));
        
        
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
        this.markAllComplete.addEventListener('click', () => this.markAllComplete());
        
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEdit.addEventListener('click', () => this.closeEditModal());
        this.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
        
       
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeEditModal();
            }
        });
        
        
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        
        this.loadTheme();
    }

    handleAddTodo(e) {
        e.preventDefault();
        
        const text = this.todoInput.value.trim();
        const priority = this.prioritySelect.value;
        const dueDate = this.dueDateInput.value;
        
        if (!text) return;
        
        const todo = {
            id: Date.now(),
            text,
            priority,
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        
       
        this.todoForm.reset();
        this.prioritySelect.value = 'medium';
        
        
        this.showNotification('Task added successfully!', 'success');
    }

    handleFilterChange(e) {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    }

    handleSortChange(e) {
        this.currentSort = e.target.value;
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
            
            const message = todo.completed ? 'Task completed!' : 'Task marked as active!';
            this.showNotification(message, todo.completed ? 'success' : 'info');
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showNotification('Task deleted!', 'error');
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingId = id;
            this.editInput.value = todo.text;
            this.editPrioritySelect.value = todo.priority;
            this.editDueDateInput.value = todo.dueDate || '';
            this.showEditModal();
        }
    }

    handleEditSubmit(e) {
        e.preventDefault();
        
        const todo = this.todos.find(t => t.id === this.editingId);
        if (todo) {
            todo.text = this.editInput.value.trim();
            todo.priority = this.editPrioritySelect.value;
            todo.dueDate = this.editDueDateInput.value || null;
            
            this.saveTodos();
            this.render();
            this.closeEditModal();
            this.showNotification('Task updated!', 'success');
        }
    }

    showEditModal() {
        this.editModal.classList.add('show');
        this.editInput.focus();
    }

    closeEditModal() {
        this.editModal.classList.remove('show');
        this.editingId = null;
    }

    clearCompletedTodos() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showNotification(`${completedCount} completed tasks cleared!`, 'success');
        }
    }

    markAllComplete() {
        const activeTodos = this.todos.filter(t => !t.completed);
        if (activeTodos.length === 0) {
            this.showNotification('All tasks are already completed!', 'info');
            return;
        }
        
        this.todos.forEach(todo => {
            todo.completed = true;
        });
        
        this.saveTodos();
        this.render();
        this.updateStats();
        this.showNotification('All tasks marked as complete!', 'success');
    }

    getFilteredTodos() {
        let filtered = [...this.todos];
        
      
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(searchTerm)
            );
        }
        
      
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = filtered.filter(todo => todo.completed);
                break;
        }
        
       
        switch (this.currentSort) {
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'alphabetical':
                filtered.sort((a, b) => a.text.localeCompare(b.text));
                break;
            case 'date':
            default:
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
        
        return filtered;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.todoList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
            
           
            this.bindTodoEvents();
        }
    }

    createTodoHTML(todo) {
        const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
        const dueDateFormatted = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : null;
        
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                    <div class="todo-meta">
                        <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
                        ${dueDateFormatted ? `
                            <span class="due-date ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-calendar"></i>
                                ${dueDateFormatted}
                                ${isOverdue ? '(Overdue)' : ''}
                            </span>
                        ` : ''}
                        <span class="created-date">
                            <i class="fas fa-clock"></i>
                            ${new Date(todo.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }

    bindTodoEvents() {
       
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.closest('.todo-item').dataset.id);
                this.toggleTodo(id);
            });
        });
        
       
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.todo-item').dataset.id);
                this.editTodo(id);
            });
        });
        
       
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.todo-item').dataset.id);
                this.deleteTodo(id);
            });
        });
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        
        this.totalTasks.textContent = total;
        this.activeTasks.textContent = active;
        this.completedTasks.textContent = completed;
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    handleKeyboardShortcuts(e) {
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (document.activeElement === this.todoInput) {
                this.todoForm.dispatchEvent(new Event('submit'));
            }
        }
        
        
        if (e.key === 'Escape' && this.editModal.classList.contains('show')) {
            this.closeEditModal();
        }
        
       
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.searchInput.focus();
        }
    }

    showNotification(message, type = 'info') {
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
       
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: this.getNotificationColor(type)
        });
        
        document.body.appendChild(notification);
        
       
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            info: '#667eea',
            warning: '#ed8936'
        };
        return colors[type] || '#667eea';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
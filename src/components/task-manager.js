import { createIcons, Trash2, FileText } from 'lucide';

export class TaskManager {
  constructor(storage, userId) {
    this.storage = storage;
    this.userId = userId;
    this.tasks = this.storage.getTasks(userId);
  }

  render() {
    const section = document.createElement('div');
    section.className = 'task-section';

    section.innerHTML = `
      <h3>Task Dashboard</h3>
      <p>Add, Edit, and Manage Your Tasks</p>
      
      <form id="taskForm" class="task-form">
        <div class="form-group">
          <label class="form-label" for="taskName">Task Name</label>
          <input 
            type="text" 
            id="taskName" 
            class="form-input" 
            placeholder="Enter task name" 
            required
          />
        </div>
        
        <div class="time-group">
          <div class="form-group">
            <label class="form-label" for="startTime">Start Time</label>
            <input type="time" id="startTime" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label" for="endTime">End Time</label>
            <input type="time" id="endTime" class="form-input" />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="dueTime">Due Date & Time</label>
          <input type="datetime-local" id="dueTime" class="form-input" />
        </div>
        
        <div class="form-group">
          <label class="form-label" for="priority">Priority</label>
          <select id="priority" class="form-input">
            <option value="high">High Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
        
        <button type="submit" class="btn btn-success">Add Task</button>
      </form>
      
      <div id="taskList" class="task-list"></div>
    `;

    section.querySelector('#taskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTask(section);
    });

    this.renderTasks(section.querySelector('#taskList'));

    createIcons({
      icons: {
        Trash2,
        FileText
      }
    });

    return section;
  }

  handleAddTask(section) {
    const taskData = {
      name: section.querySelector('#taskName').value,
      startTime: section.querySelector('#startTime').value,
      endTime: section.querySelector('#endTime').value,
      dueTime: section.querySelector('#dueTime').value,
      priority: section.querySelector('#priority').value
    };

    this.storage.addTask(this.userId, taskData);
    this.tasks = this.storage.getTasks(this.userId);
    
    section.querySelector('#taskForm').reset();
    this.renderTasks(section.querySelector('#taskList'));
  }

  renderTasks(container) {
    container.innerHTML = '';
    
    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="file-text"></i></div>
          <p>No tasks yet. Add your first task to get started!</p>
        </div>
      `;
      createIcons({ icons: { FileText } });
      return;
    }

    this.tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).forEach(task => {
      const taskItem = this.createTaskItem(task);
      container.appendChild(taskItem);
    });

    createIcons({ icons: { Trash2 } });
  }

  createTaskItem(task) {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority === 'high' ? 'high-priority' : ''}`;

    const formatTime = (time) => {
      if (!time) return '';
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    };

    const formatDateTime = (datetime) => {
      if (!datetime) return '';
      return new Date(datetime).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    item.innerHTML = `
      <div class="task-content">
        <div class="task-header">
          <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''}
            data-task-id="${task.id}"
          />
          <h4 class="task-title ${task.completed ? 'completed' : ''}">${task.name}</h4>
        </div>
        <div class="task-meta">
          ${task.startTime ? `<span class="task-meta-item">🕐 ${formatTime(task.startTime)}${task.endTime ? ` - ${formatTime(task.endTime)}` : ''}</span>` : ''}
          ${task.dueTime ? `<span class="task-meta-item">📅 ${formatDateTime(task.dueTime)}</span>` : ''}
          <span class="priority-badge priority-${task.priority}">${task.priority === 'high' ? '🔴 High' : '🔵 Low'}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn delete-btn" data-task-id="${task.id}" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    `;

    item.querySelector('.task-checkbox').addEventListener('change', (e) => {
      this.storage.updateTask(task.id, { completed: e.target.checked });
      this.tasks = this.storage.getTasks(this.userId);
      this.renderTasks(item.parentElement);
    });

    item.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this task?')) {
        this.storage.deleteTask(task.id);
        this.tasks = this.storage.getTasks(this.userId);
        this.renderTasks(item.parentElement);
      }
    });

    return item;
  }
}

import { createIcons, List, CheckSquare, Clock, AlertTriangle, ArrowLeft } from 'lucide';

export class Analytics {
  constructor(storage, userId) {
    this.storage = storage;
    this.userId = userId;
    this.tasks = this.storage.getTasks(userId);
    this.view = 'overview'; // 'overview' or 'list'
    this.listFilter = null; // 'total', 'completed', 'pending', 'high-priority'
    this.listTitle = '';
    this.element = document.createElement('div');
    this.element.className = 'analytics-section-wrapper';
  }

  render() {
    this.element.innerHTML = '';
    if (this.view === 'overview') {
      this.renderOverview();
    } else {
      this.renderListView();
    }
    return this.element;
  }

  renderOverview() {
    const completedTasks = this.tasks.filter(t => t.completed).length;
    const totalTasks = this.tasks.length;
    const incompleteTasks = totalTasks - completedTasks;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const highPriorityTasks = this.tasks.filter(t => t.priority === 'high').length;

    const overviewEl = document.createElement('div');
    overviewEl.className = 'analytics-section';
    overviewEl.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card" data-filter="total" data-title="All Tasks">
          <div class="stat-icon"><i data-lucide="list"></i></div>
          <div class="stat-value">${totalTasks}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        
        <div class="stat-card" data-filter="completed" data-title="Completed Tasks">
          <div class="stat-icon"><i data-lucide="check-square"></i></div>
          <div class="stat-value">${completedTasks}</div>
          <div class="stat-label">Completed Tasks</div>
        </div>
        
        <div class="stat-card" data-filter="pending" data-title="Pending Tasks">
          <div class="stat-icon"><i data-lucide="clock"></i></div>
          <div class="stat-value">${incompleteTasks}</div>
          <div class="stat-label">Pending Tasks</div>
        </div>
        
        <div class="stat-card" data-filter="high-priority" data-title="High Priority Tasks">
          <div class="stat-icon"><i data-lucide="alert-triangle"></i></div>
          <div class="stat-value">${highPriorityTasks}</div>
          <div class="stat-label">High Priority</div>
        </div>
      </div>
      
      <div class="chart-container">
        <h3>Progress Overview</h3>
        <div class="progress-bar-container">
          <div class="progress-label">
            <span>Completion Rate</span>
            <span><strong>${progress}%</strong></span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        
        <h3 style="margin-top: 2rem">7-Day Streak</h3>
        <div class="streak-container">
          ${this.renderStreakDays()}
        </div>
      </div>
    `;
    this.element.appendChild(overviewEl);

    this.element.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        this.showList(card.dataset.filter, card.dataset.title);
      });
    });

    createIcons({
      icons: {
        List,
        CheckSquare,
        Clock,
        AlertTriangle
      }
    });
  }

  renderListView() {
    let filteredTasks = [];
    switch (this.listFilter) {
      case 'total':
        filteredTasks = this.tasks;
        break;
      case 'completed':
        filteredTasks = this.tasks.filter(t => t.completed);
        break;
      case 'pending':
        filteredTasks = this.tasks.filter(t => !t.completed);
        break;
      case 'high-priority':
        filteredTasks = this.tasks.filter(t => t.priority === 'high');
        break;
    }

    const listEl = document.createElement('div');
    listEl.className = 'analytics-list-view';

    let taskListHtml = '';
    if (filteredTasks.length > 0) {
      taskListHtml = filteredTasks.map(task => `<li>${task.name}</li>`).join('');
    } else {
      taskListHtml = '<p class="empty-state">No tasks in this category.</p>';
    }

    listEl.innerHTML = `
      <h3>
        <button class="btn back-btn"><i data-lucide="arrow-left"></i> Back</button>
        <span>${this.listTitle}</span>
      </h3>
      <ul class="task-name-list">
        ${taskListHtml}
      </ul>
    `;
    this.element.appendChild(listEl);

    this.element.querySelector('.back-btn').addEventListener('click', () => {
      this.showOverview();
    });

    createIcons({
      icons: {
        ArrowLeft
      }
    });
  }

  renderStreakDays() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    
    return days.map((day, index) => {
      const isActive = index <= dayIndex;
      return `<div class="streak-day ${isActive ? 'active' : ''}">${day}</div>`;
    }).join('');
  }

  showList(filter, title) {
    this.view = 'list';
    this.listFilter = filter;
    this.listTitle = title;
    this.render();
  }

  showOverview() {
    this.view = 'overview';
    this.listFilter = null;
    this.listTitle = '';
    this.render();
  }
}

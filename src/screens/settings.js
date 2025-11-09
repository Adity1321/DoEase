export class SettingsScreen {
  constructor(user, onUserUpdate) {
    this.user = user;
    this.onUserUpdate = onUserUpdate;
    this.element = document.createElement('div');
    this.element.className = 'settings-section-wrapper';
  }

  render() {
    this.element.innerHTML = `
      <div class="content-header">
        <h2>Settings</h2>
      </div>
      <div class="settings-section profile-section">
        <h3>Notifications</h3>
        <div class="setting-item">
          <div class="setting-text">
            <label for="emailNotifications">Enable Email Notifications</label>
            <p>Receive reminders for tasks and updates on your productivity streak.</p>
          </div>
          <div class="setting-toggle">
            <label class="switch">
              <input type="checkbox" id="emailNotifications" ${this.user.email_notifications_enabled ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    `;

    this.element.querySelector('#emailNotifications').addEventListener('change', async (e) => {
      const isEnabled = e.target.checked;
      try {
        await this.onUserUpdate({ email_notifications_enabled: isEnabled });
        // Optimistically update user object
        this.user.email_notifications_enabled = isEnabled;
        alert('Notification settings updated successfully!');
      } catch (error) {
        alert(`Failed to update settings: ${error.message}`);
        // Revert checkbox on failure
        e.target.checked = !isEnabled;
      }
    });

    return this.element;
  }
}

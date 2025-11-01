export class ProfileScreen {
  constructor(user, onLogout, onUserUpdate) {
    this.user = user;
    this.onLogout = onLogout;
    this.onUserUpdate = onUserUpdate;
    this.isEditing = false;
    this.element = document.createElement('div');
    this.element.className = 'profile-section-wrapper';
  }

  render() {
    this.element.innerHTML = ''; // Clear content before re-rendering
    if (this.isEditing) {
      this.element.appendChild(this.renderEditForm());
    } else {
      this.element.appendChild(this.renderDisplay());
    }
    return this.element;
  }

  renderDisplay() {
    const displaySection = document.createElement('div');
    displaySection.className = 'profile-section';
    const initials = this.user.username.substring(0, 2).toUpperCase();

    displaySection.innerHTML = `
      <div class="profile-avatar-large">${initials}</div>
      <h2 class="profile-username">${this.user.username}</h2>
      <p class="profile-email">${this.user.email}</p>
      <div class="profile-actions">
        <button class="btn btn-secondary" id="editProfileBtn">Edit Profile</button>
      </div>
    `;

    displaySection.querySelector('#editProfileBtn').addEventListener('click', () => {
      this.isEditing = true;
      this.render();
    });

    return displaySection;
  }

  renderEditForm() {
    const formSection = document.createElement('div');
    formSection.className = 'profile-section';

    formSection.innerHTML = `
      <h2>Edit Profile</h2>
      <form id="editProfileForm">
        <div class="form-group">
          <label class="form-label" for="editUsername">Username</label>
          <input 
            type="text" 
            id="editUsername" 
            class="form-input" 
            value="${this.user.username}" 
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="editEmail">Email</label>
          <input 
            type="email" 
            id="editEmail" 
            class="form-input" 
            value="${this.user.email}" 
            required
          />
        </div>
        <div class="profile-actions">
          <button type="button" class="btn btn-secondary" id="cancelEditBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    formSection.querySelector('#editProfileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedUser = {
        username: formSection.querySelector('#editUsername').value,
        email: formSection.querySelector('#editEmail').value,
      };
      this.onUserUpdate(updatedUser);
      this.isEditing = false;
    });

    formSection.querySelector('#cancelEditBtn').addEventListener('click', () => {
      this.isEditing = false;
      this.render();
    });

    return formSection;
  }
}

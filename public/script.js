
const STORAGE_KEY = 'workshop-projects-v1';

let projects = [];
let editingId = null;

const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const formTitle = document.querySelector('#form-title');
const messageEl = document.querySelector('#message');

function showMessage(text, isError = false) {
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.style.color = isError ? '#dc2626' : '#64748b';
  }
}

function loadProjects() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      showMessage('Stored project data is invalid. Please reset storage.', true);
      return [];
    }
    return parsed;
  } catch (err) {
    showMessage('Error reading stored projects. Data may be malformed.', true);
    return [];
  }
}

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    showMessage('Could not save changes to storage.', true);
  }
}

// Initialize projects from localStorage on startup
projects = loadProjects();

function render() {
  projectList.innerHTML = '';

  if (projects.length === 0) {
    if (emptyState) {
      emptyState.style.display = 'block';
    }
    return;
  }

  if (emptyState) {
    emptyState.style.display = 'none';
  }

  projects.forEach(project => {
    const li = document.createElement('li');
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = project.name;

    const statusSpan = document.createElement('span');
    statusSpan.textContent = ` — Status: ${project.status}`;

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.style.marginLeft = '0.5rem';
    editBtn.addEventListener('click', () => {
      startEdit(project);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '0.5rem';
    deleteBtn.addEventListener('click', () => {
      confirmAndDelete(project);
    });

    li.appendChild(nameSpan);
    li.appendChild(statusSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    projectList.appendChild(li);
  });
}

function startEdit(project) {
  editingId = project.id;
  nameInput.value = project.name;
  statusInput.value = project.status;
  
  if (formTitle) formTitle.textContent = 'Edit Project';
  saveButton.textContent = 'Save changes';
  cancelButton.hidden = false;
  nameInput.focus();
  showMessage('');
}

function resetFormMode() {
  editingId = null;
  form.reset();
  if (formTitle) formTitle.textContent = 'Add Project';
  saveButton.textContent = 'Save Project';
  cancelButton.hidden = true;
}

function confirmAndDelete(project) {
  const confirmed = window.confirm(`Are you sure you want to delete "${project.name}"?`);
  if (!confirmed) {
    return;
  }

  if (editingId === project.id) {
    resetFormMode();
  }

  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects.splice(index, 1);
    saveProjects();
    render();
    showMessage('Project deleted.');
  }
}

cancelButton.addEventListener('click', () => {
  resetFormMode();
  showMessage('');
});

form.addEventListener('submit', event => {
  event.preventDefault();
  
  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    return;
  }

  if (editingId) {
    const project = projects.find(p => p.id === editingId);
    if (project) {
      project.name = name;
      project.status = status;
      showMessage('Project updated successfully.');
    }
  } else {
    const newProject = {
      id: Date.now().toString(),
      name: name,
      status: status
    };
    projects.push(newProject);
    showMessage('Project added successfully.');
  }

  saveProjects();
  render();
  resetFormMode();
});

// Initial render check
render();

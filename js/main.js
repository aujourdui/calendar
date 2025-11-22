'use strict';

console.clear();

const STORAGE_KEY = 'todo-items-v1';
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const count = document.getElementById('task-count');
const clearCompletedButton = document.getElementById('clear-completed');
const filterButtons = Array.from(document.querySelectorAll('.filter'));

const state = {
  items: [],
  filter: 'all',
};

function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      state.items = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load todos:', error);
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function updateCount() {
  const remaining = state.items.filter(item => !item.completed).length;
  count.textContent = `${remaining} 件`;
}

function createTodoElement(item) {
  const li = document.createElement('li');
  li.className = `todo-item${item.completed ? ' is-completed' : ''}`;
  li.dataset.id = item.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-item__checkbox';
  checkbox.checked = item.completed;
  checkbox.addEventListener('change', () => toggleTodo(item.id));

  const text = document.createElement('p');
  text.className = 'todo-item__text';
  text.textContent = item.text;

  const deleteButton = document.createElement('button');
  deleteButton.className = 'todo-item__delete';
  deleteButton.type = 'button';
  deleteButton.setAttribute('aria-label', `${item.text} を削除`);
  deleteButton.textContent = '×';
  deleteButton.addEventListener('click', () => deleteTodo(item.id));

  li.append(checkbox, text, deleteButton);
  return li;
}

function renderList() {
  list.innerHTML = '';
  const filtered = state.items.filter(item => {
    if (state.filter === 'active') return !item.completed;
    if (state.filter === 'completed') return item.completed;
    return true;
  });

  if (filtered.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'todo-item';
    empty.textContent = 'タスクはまだありません';
    list.appendChild(empty);
  } else {
    filtered.map(createTodoElement).forEach(element => list.appendChild(element));
  }

  updateCount();
}

function addTodo(text) {
  const newItem = {
    id: crypto.randomUUID(),
    text,
    completed: false,
  };
  state.items.unshift(newItem);
  saveItems();
  renderList();
}

function toggleTodo(id) {
  state.items = state.items.map(item =>
    item.id === id ? { ...item, completed: !item.completed } : item
  );
  saveItems();
  renderList();
}

function deleteTodo(id) {
  state.items = state.items.filter(item => item.id !== id);
  saveItems();
  renderList();
}

function clearCompleted() {
  state.items = state.items.filter(item => !item.completed);
  saveItems();
  renderList();
}

function setFilter(filter) {
  state.filter = filter;
  filterButtons.forEach(button => {
    button.classList.toggle('is-active', button.dataset.filter === filter);
  });
  renderList();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  addTodo(value);
  input.value = '';
  input.focus();
});

clearCompletedButton.addEventListener('click', clearCompleted);
filterButtons.forEach(button =>
  button.addEventListener('click', () => setFilter(button.dataset.filter))
);

loadItems();
renderList();

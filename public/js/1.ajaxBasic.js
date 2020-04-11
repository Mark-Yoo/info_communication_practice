
// State
let todos = [];
const $inputTodo = document.querySelector('.input-todo');
const $nav = document.querySelector('.nav');
const $todos = document.querySelector('.todos');
const $completeAll = document.querySelector('.complete-all');
const $clearCompleted = document.querySelector('.clear-completed');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');
let navId = 'all';

const ajax = (() => {
  const xhrFunction = (...arg) => {
     const [method, url, callback, payload] = arg;
     const xhr = new XMLHttpRequest();
     xhr.open(method, url);
     xhr.setRequestHeader('content-type', 'application/json');
     xhr.send(JSON.stringify(payload));
     xhr.onload = () => {
       if (xhr.status === 200 || xhr.status === 201) {
         callback(JSON.parse(xhr.response));
       } else {
         console.error(`${xhr.status} ${xhr.statusText}`);
       }
     }
  }

  return {
    get(url, callback) {
      xhrFunction('GET', url, callback);
    },
    post(url, payload, callback) {
      xhrFunction('POST', url, callback, payload);
    },
    patch(url, payload, callback) {
      xhrFunction('PATCH', url, callback, payload);
    },
    delete(url, callback) {
      xhrFunction('DELETE', url, callback);
    },
  }
})();

const render = () => {
  let copiedList = [];
  let html = '';

  copiedList = todos.filter(todo => navId === 'all' ? todo : navId === 'active' ? !todo.completed : todo.completed);

  copiedList.forEach(({id, content, completed}) => html += `<li id="${id}" class="todo-item">
  <input id="ck-${id}" class="checkbox" type="checkbox" ${completed ? 'checked' : ''}>
  <label for="ck-${id}">${content}</label>
  <i class="remove-todo far fa-times-circle"></i>
</li>`);


  $completeAll.firstChild.nextSibling.checked =  copiedList.length ? copiedList.map(todo => todo.completed).indexOf(false) === -1 ? true : false : false;

  $completedTodos.innerHTML = todos.filter(todo => todo.completed).length;

  $activeTodos.innerHTML = todos.filter(todo => !todo.completed).length;

  $todos.innerHTML = html;
}

const getTodos = () => {
  ajax.get('/todos', data => {
    todos = data.sort((a, b) => b['id'] - a['id']);
    render();
  });
}

const addTodo = ({ keyCode }) => {
  const content = $inputTodo.value.trim();
  if (keyCode !== 13) return;
  if (content === '') return $inputTodo.value = '';
  ajax.post('/todos', {id: generateId(), content, completed: false}, data => {
    todos = [data, ...todos];
    render();
  });
  $inputTodo.value = '';
}

const swapNav = ({ target }) => {
  if (!target.matches('.nav > li:not(.active)')) return;
  [...target.parentNode.children].forEach(navItem => navItem.classList.toggle('active', navItem.id === target.id));
  navId = target.id;
  // [...target.parentNode.children].forEach(nav => nav.classList.remove('active'));
  // navId = target.id;
  // if (target.id === navId) target.classList.add('active');
  render();
}

const toggleTodo = ({ target }) => {
  ajax.patch(`/todos/${target.parentNode.id}`, {completed: target.checked}, () => {
    todos = todos.map(todo => +target.parentNode.id === todo.id ? { ...todo, completed: !todo.completed } : todo);
    render();
  });
}

const removeTodo = ({ target }) => {
  if (!target.matches('.todos > li > i')) return;
  ajax.delete(`/todos/${target.parentNode.id}`, () => {
    todos = todos.filter(todo => +target.parentNode.id !== todo.id);
    render();
  })
}

const toggleAll = ({ target }) => {
  todos = todos.map(todo => {
      ajax.patch(`/todos/${todo.id}`, {completed: target.checked}, () => {
      render();
    })
    return todo = {...todo, completed: target.checked};
  })
}

const clearCompleted = ({ target }) => {
  if (!target.matches('.clear-completed > button')) return;
  todos = todos.filter(todo => todo.completed ? ajax.delete(`/todos/${todo.id}`, () => {render()}) : todo.completed === false);
  $completeAll.firstChild.nextSibling.checked = false;
}

const generateId = () => {
  return todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;
}

window.onload = getTodos;

$inputTodo.onkeyup = (e) => {
  addTodo(e);
}

$nav.onclick = (e) => {
  swapNav(e);
}

$todos.onchange = (e) => {
  toggleTodo(e);
}

$todos.onclick = (e) => {
  removeTodo(e);
}

$completeAll.onchange = (e) => {
  toggleAll(e); 
}

$clearCompleted.onclick = (e) => {
  clearCompleted(e)
}
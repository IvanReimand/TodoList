const tasks = [];
let lastTaskId = 0;

let taskList;
let addTask;
let loginForm;
let usernameField;
let passwordField;
let registrationForm;
let regUsernameField;
let regPasswordField;
let regConfirmPasswordField;
let accessToken = 'q1JuBvAKjewJREA1F7lLFx9GoQiO2GqS'; // To store the JWT token

// Kui leht on brauseris laetud siis lisame esimesed taskid lehele
window.addEventListener('load', () => {
    if (window.location.pathname.includes('index.html')) {
        initTasksPage();
    }
    if (window.location.pathname.includes('login.html')) {
        initLoginPage();
    }
    if (window.location.pathname.includes('register.html')) {
        initRegisterPage();
    }
});

// Инициализация страницы задач
function initTasksPage() {
    taskList = document.querySelector('#task-list');
    addTask = document.querySelector('#add-task');

    loadTasks();

    // Kui nuppu vajutatakse siis lisatakse uus task
    addTask.addEventListener('click', () => {
        const task = createTask(); // Teeme kõigepealt lokaalsesse "andmebaasi" uue taski
        const taskRow = createTaskRow(task); // Teeme uue taski HTML elementi mille saaks lehe peale listi lisada
        taskList.appendChild(taskRow); // Lisame taski lehele
        addTaskToApi(task);
    });
}

// Инициализация страницы логина
function initLoginPage() {
    loginForm = document.getElementById('loginForm');
    usernameField = document.getElementById('username');
    passwordField = document.getElementById('password');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = usernameField.value;
        const password = passwordField.value;

        // Fetch access token
        loginUser(username, password);
    });
}

// Инициализация страницы регистрации
function initRegisterPage() {
    registrationForm = document.getElementById('registrationForm');
    regUsernameField = document.getElementById('regUsername');
    regFirstnameField = document.getElementById('regFirstname');
    regLastnameField = document.getElementById('regLastname');
    regPasswordField = document.getElementById('regPassword');
    regConfirmPasswordField = document.getElementById('confirmPassword');

    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const regUsername = regUsernameField.value;
        const regPassword = regPasswordField.value;
        const regFirstname = regFirstnameField.value;
        const regLastname = regLastnameField.value;
        const confirmPassword = regConfirmPasswordField.value;

        // Check if passwords match
        if (regPassword !== confirmPassword) {
            window.antd.notification.error({
                message: 'Passwords do not match',
            });
            return;
        }

        // Check if fields are empty
        if (regUsername === "" || regPassword === "") {
            window.antd.notification.error({
                message: 'Please fill all fields',
            });
            return;
        }

        // Register user and get access token
        registerUser(regUsername, regFirstname, regLastname, regPassword);
    });
}

// User registration via API
async function registerUser(username, firstname, lastname, password) {
    const response = await fetch('https://demo2.z-bit.ee/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            username: username,
            firstname: firstname,
            lastname: lastname,
            newPassword: password
        }),
    });

    if (response.ok) {
        const data = await response.json();
        window.antd.notification.success({
            message: 'Registration successful',
        });
        window.location.href = "/login"; // Redirect to login page after registration
    } else {
        const errorData = await response.json();
        window.antd.notification.error({
            message: errorData.message,
        });
    }
}

// Abibib

// User login via API to get the access token
async function loginUser(username, password) {
    const response = await fetch('https://demo2.z-bit.ee/users/get-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        }),
    });

    if (response.ok) {
        const data = await response.json();
        accessToken = data.access_token; // Save the token for subsequent requests
        window.antd.notification.success({
            message: 'Logged in successfully',
        });
        window.location.href = "/"; // Redirect to tasks page
    } else {
        const errorData = await response.json();
        window.antd.notification.error({
            message: 'Wrong username or password',
        });
    }
}

// Fetch and display tasks
async function loadTasks() {
    const response = await fetch('https://demo2.z-bit.ee/tasks', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        const tasksData = await response.json();
        tasksData.forEach(renderTask);
    } else {
        window.antd.notification.error({
            message: 'Failed to load tasks',
        });
    }
}

// Add task via API
async function addTaskToApi(task) {
    const response = await fetch('https://demo2.z-bit.ee/tasks', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: task.name,
            desc: '',
        }),
    });

    if (response.ok) {
        const data = await response.json();
        task.id = data.id; // Update task with the returned ID from the API
    } else {
        window.antd.notification.error({
            message: 'Failed to add task',
        });
    }
}

function renderTask(task) {
    const taskRow = createTaskRow(task);
    taskList.appendChild(taskRow);
}

function createTask() {
    lastTaskId++;
    const task = {
        id: lastTaskId,
        name: 'Task ' + lastTaskId,
        completed: false
    };
    tasks.push(task);
    return task;
}

function createTaskRow(task) {
    let taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute('data-template');
    taskRow.addEventListener('dragstart', (event) => {
        console.log('dragstart', event)
    })

    // Täidame vormi väljad andmetega
    const name = taskRow.querySelector("[name='name']");
    name.value = task.title;
    name.addEventListener('change', (event) => {
        console.log(event)
        task.title = event.target.value
        updateTaskFromApi(task);
    });

    console.log(task)
    

    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.marked_as_done;
    checkbox.addEventListener('click', (event) => {
        console.log(event)
        task.marked_as_done = event.target.checked
        updateTaskFromApi(task);
    });

    const deleteButton = taskRow.querySelector('.delete-task');
    deleteButton.addEventListener('click', () => {
        taskList.removeChild(taskRow);
        tasks.splice(tasks.indexOf(task), 1);
        deleteTaskFromApi(task.id);
    });
    
    hydrateAntCheckboxes(taskRow);
    
    return taskRow;
}

// Delete task via API
async function deleteTaskFromApi(taskId) {
    const response = await fetch(`https://demo2.z-bit.ee/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        window.antd.notification.error({
            message: 'Failed to delete task',
        });
    }
}

async function updateTaskFromApi(task) {
    const response = await fetch(`https://demo2.z-bit.ee/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        window.antd.notification.error({
            message: 'Failed to delete task',
        });
    }
}

// Kasutame Ant Design sarnaseid checkboxe
function hydrateAntCheckboxes(element) {
    const elements = element.querySelectorAll('.ant-checkbox-wrapper');
    elements.forEach(wrapper => {
        if (wrapper.__hydrated) return;
        wrapper.__hydrated = true;

        const checkbox = wrapper.querySelector('.ant-checkbox');
        const input = wrapper.querySelector('.ant-checkbox-input');

        if (input.checked) {
            checkbox.classList.add('ant-checkbox-checked');
        }

        input.addEventListener('change', () => {
            checkbox.classList.toggle('ant-checkbox-checked');
        });
    });
}

// Helper function to create Ant Design styled checkboxes
function createAntCheckbox() {
    const checkbox = document.querySelector('[data-template="ant-checkbox"]').cloneNode(true);
    checkbox.removeAttribute('data-template');
    hydrateAntCheckboxes(checkbox);
    return checkbox;
}

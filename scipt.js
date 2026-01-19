// ===== VARIABEL GLOBAL =====
// Array untuk menyimpan semua tugas
let tasks = [];
let currentFilter = 'all'; // 'all', 'completed', 'active'

// Mengambil elemen HTML yang akan kita gunakan
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const statsText = document.getElementById('statsText');
const searchInput = document.getElementById('searchInput');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const prioritySelect = document.getElementById('prioritySelect');
const deadlineInput = document.getElementById('deadlineInput');

// ===== FUNGSI UTAMA =====

// Fungsi untuk menambah tugas baru
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Tolong masukkan nama tugas terlebih dahulu!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: prioritySelect.value,
        deadline: deadlineInput.value || null
    };
    
    tasks.push(task);
    taskInput.value = '';
    prioritySelect.value = 'normal';
    deadlineInput.value = '';
    taskInput.focus();
    
    saveTasks();
    renderTasks();
}

// Fungsi untuk menampilkan semua tugas
function renderTasks() {
    searchInput.value = '';
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">Belum ada tugas. Yuk tambahkan!</div>';
        updateStats();
        updateClearButton();
        return;
    }

    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    filteredTasks = sortTasksByPriority(filteredTasks);
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">Tidak ada tugas di kategori ini</div>';
        updateStats();
        updateClearButton();
        return;
    }
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
        // Get deadline info
        const deadlineInfo = getDeadlineInfo(task.deadline);
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="priority-badge priority-${task.priority}">
                ${getPriorityLabel(task.priority)}
            </span>
            ${deadlineInfo ? `
                <span class="deadline-badge deadline-${deadlineInfo.status}">
                    ${deadlineInfo.icon} ${deadlineInfo.text}
                </span>
            ` : ''}
            <span class="task-text">${task.text}</span>
            <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Hapus</button>
        `;
        
        taskList.appendChild(li);
    });
    
    updateStats();
    updateClearButton();
}

// Fungsi untuk menandai tugas selesai/belum selesai
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Fungsi untuk menghapus tugas
function deleteTask(id) {
    if (confirm('Yakin ingin menghapus tugas ini?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Fungsi untuk edit tugas
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        const newText = prompt('Edit nama tugas:', task.text);
        
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }
}

// Fungsi untuk update statistik
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    
    if (total === 0) {
        statsText.textContent = 'Belum ada tugas';
    } else {
        statsText.textContent = `Total: ${total} tugas | Selesai: ${completed} | Tersisa: ${remaining}`;
    }
}

// Fungsi untuk search tugas
function searchTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => 
        task.text.toLowerCase().includes(searchTerm)
    );
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">Tugas tidak ditemukan</div>';
        return;
    }
    
    const sortedTasks = sortTasksByPriority(filteredTasks);
    
    sortedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
        // Get deadline info
        const deadlineInfo = getDeadlineInfo(task.deadline);
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="priority-badge priority-${task.priority}">
                ${getPriorityLabel(task.priority)}
            </span>
            ${deadlineInfo ? `
                <span class="deadline-badge deadline-${deadlineInfo.status}">
                    ${deadlineInfo.icon} ${deadlineInfo.text}
                </span>
            ` : ''}
            <span class="task-text">${task.text}</span>
            <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Hapus</button>
        `;
        
        taskList.appendChild(li);
    });
}

// Fungsi untuk set filter
function setFilter(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    renderTasks();
}

// Fungsi untuk clear completed tasks
function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        alert('Tidak ada tugas selesai untuk dihapus!');
        return;
    }
    
    if (confirm(`Yakin ingin menghapus ${completedCount} tugas yang sudah selesai?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }
}

// Fungsi untuk update clear button
function updateClearButton() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount > 0) {
        clearCompletedBtn.disabled = false;
        clearCompletedBtn.textContent = `🗑️ Bersihkan Tugas Selesai (${completedCount})`;
    } else {
        clearCompletedBtn.disabled = true;
        clearCompletedBtn.textContent = '🗑️ Bersihkan Tugas Selesai';
    }
}

// Fungsi untuk get priority label
function getPriorityLabel(priority) {
    switch(priority) {
        case 'low':
            return '🟢 Rendah';
        case 'high':
            return '🔴 Tinggi';
        default:
            return '🟡 Normal';
    }
}

// Fungsi untuk get deadline info
function getDeadlineInfo(deadline) {
    if (!deadline) {
        return null;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    // Hitung selisih hari
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status, text, icon;
    
    if (diffDays < 0) {
        // Lewat deadline
        status = 'overdue';
        icon = '🔴';
        text = `Terlambat ${Math.abs(diffDays)} hari`;
    } else if (diffDays === 0) {
        // Hari ini
        status = 'today';
        icon = '⚡';
        text = 'Hari ini!';
    } else if (diffDays <= 3) {
        // Deadline dekat (1-3 hari)
        status = 'soon';
        icon = '⚠️';
        text = `${diffDays} hari lagi`;
    } else {
        // Masih lama
        status = 'upcoming';
        icon = '📅';
        text = `${diffDays} hari lagi`;
    }
    
    return { status, text, icon };
}

// Fungsi untuk sort tasks by priority
function sortTasksByPriority(tasksArray) {
    const priorityWeight = {
        'high': 3,
        'normal': 2,
        'low': 1
    };
    
    return tasksArray.sort((a, b) => {
        // Sort by priority first
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        
        if (priorityDiff !== 0) {
            return priorityDiff;
        }
        
        // If same priority, sort by deadline
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        } else if (a.deadline) {
            return -1; // a has deadline, put it first
        } else if (b.deadline) {
            return 1; // b has deadline, put it first
        }
        
        return 0;
    });
}

// ===== LOCAL STORAGE =====

// Fungsi untuk menyimpan ke localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Fungsi untuk memuat dari localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        
        // Migrasi data lama
        tasks = tasks.map(task => {
            if (!task.priority) {
                task.priority = 'normal';
            }
            if (!task.hasOwnProperty('deadline')) {
                task.deadline = null;
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
}

// ===== EVENT LISTENERS =====

// Tombol tambah diklik
addButton.addEventListener('click', addTask);

// Enter di keyboard untuk menambah tugas
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Search input
searchInput.addEventListener('input', searchTasks);

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        setFilter(filter);
    });
});

// Clear completed button
clearCompletedBtn.addEventListener('click', clearCompleted);

// ===== INISIALISASI =====
// Muat tugas yang tersimpan saat halaman dibuka
loadTasks();
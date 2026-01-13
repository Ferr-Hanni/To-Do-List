 // ===== VARIABEL GLOBAL =====
 // Array untuk menyimpan semua tugas
 let tasks = [];
 let currentFilter = 'all'; // 'all', 'completed', 'remaining'
 
 // Mengambil elemen HTML yang akan kita gunakan
 const taskInput = document.getElementById('taskInput');
 const addButton = document.getElementById('addButton');
 const taskList = document.getElementById('taskList');
 const statsText = document.getElementById('statsText');
 const searchInput = document.getElementById('searchInput');

 // ===== FUNGSI UTAMA =====
 
 // Fungsi untuk menambah tugas baru
 function addTask() {
     const taskText = taskInput.value.trim(); // Ambil teks dan hapus spasi di awal/akhir
     
     // Validasi: cek apakah input kosong
     if (taskText === '') {
         alert('Tolong masukkan nama tugas terlebih dahulu!');
         return;
     }
     
     // Membuat objek tugas baru
     const task = {
         id: Date.now(), // ID unik menggunakan timestamp
         text: taskText,
         completed: false
     };
     
     // Menambahkan tugas ke array
     tasks.push(task);
     
     // Kosongkan input setelah ditambahkan
     taskInput.value = '';
     
     // Fokus kembali ke input
     taskInput.focus();
     
     // Simpan ke localStorage dan render ulang tampilan
     saveTasks();
     renderTasks();
 }
 
 // Fungsi untuk menampilkan semua tugas
 function renderTasks() {
    // Reset search input saat render ulang
    searchInput.value = '';  // Hint: property untuk mengosongkan input
     // Kosongkan daftar tugas terlebih dahulu
     taskList.innerHTML = '';
     
     // Cek apakah ada tugas
     if (tasks.length === 0) {
         taskList.innerHTML = '<div class="empty-message">Belum ada tugas. Yuk tambahkan!</div>';
         updateStats();
         return;
     }

         // TAMBAHKAN FILTER LOGIC DI SINI (SEBELUM forEach)
    let filteredTasks = tasks; // Default: tampilkan semua
    
    if (currentFilter === 'active') {
        // Filter hanya tugas yang belum selesai
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        // Filter hanya tugas yang sudah selesai
        filteredTasks = tasks.filter(t => t.completed);
    }
    // Kalau currentFilter === 'all', filteredTasks tetap semua tasks
    
    // Cek apakah ada hasil setelah filter
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">Tidak ada tugas di kategori ini</div>';
        updateStats();
        return;
    }
    
//  LOOP YANG BENAR - pakai filteredTasks
filteredTasks.forEach(task => {  // ← UBAH DARI tasks JADI filteredTasks
    const li = document.createElement('li');
    li.className = 'task-item';
    
    if (task.completed) {
        li.classList.add('completed');
    }
    
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="checkbox" 
            ${task.completed ? 'checked' : ''}
            onchange="toggleTask(${task.id})"
        >
        <span class="task-text">${task.text}</span>
        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Hapus</button>
    `;
    
    taskList.appendChild(li);
});

updateStats();
    }

 // Fungsi untuk menandai tugas selesai/belum selesai
 function toggleTask(id) {
     // Cari tugas berdasarkan ID
     const task = tasks.find(t => t.id === id);
     
     if (task) {
         // Toggle status completed
         task.completed = !task.completed;
         saveTasks();
         renderTasks();
     }
 }
 
 // Fungsi untuk menghapus tugas
 function deleteTask(id) {
     // Konfirmasi sebelum menghapus
     if (confirm('Yakin ingin menghapus tugas ini?')) {
         // Filter array, hapus tugas dengan ID yang sesuai
         tasks = tasks.filter(t => t.id !== id);
         saveTasks();
         renderTasks();
     }
 }

 function editTask(id) {
    // 1. Cari task berdasarkan id
    const task = tasks.find(t => t.id === id);
    
    // 2. Cek apakah task ditemukan
    if (task) {
        // 3. Tampilkan prompt untuk input teks baru
        const newText = prompt('Edit nama tugas:', task.text);
        
        // 4. Cek apakah user tidak cancel dan input tidak kosong
        if (newText !== null && newText.trim() !== '') {
            // 5. Update task.text dengan newText yang sudah di-trim
            task.text = newText.trim();
            
            // 6. Simpan ke localStorage
            saveTasks();
            
            // 7. Render ulang tampilan
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

 // TAMBAHKAN FUNGSI SEARCH DI SINI
function searchTasks() {
    // 1. Ambil nilai search dan ubah ke lowercase
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // 2. Kosongkan taskList
    taskList.innerHTML = '';
    
    // 3. Filter tasks yang mengandung kata kunci
    const filteredTasks = tasks.filter(task => 
        task.text.toLowerCase().includes(searchTerm)
    );
    
    // 4. Cek apakah ada hasil
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">Tugas tidak ditemukan</div>';
        return;
    }
    
    // 5. Loop dan tampilkan hasil pencarian (SAMA seperti renderTasks)
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${task.text}</span>
            <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Hapus</button>
        `;
        
        taskList.appendChild(li);
    });
}

// TAMBAHKAN FUNGSI SET FILTER DI SINI
function setFilter(filter) {
    // 1. Update variabel currentFilter
    currentFilter = filter;
    
    // 2. Update tampilan tombol (hapus class 'active' dari semua tombol)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 3. Tambahkan class 'active' ke tombol yang diklik
    // Cari tombol dengan data-filter yang sesuai
    const activeButton = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // 4. Render ulang tasks dengan filter baru
    renderTasks();
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

 // TAMBAHKAN EVENT LISTENER SEARCH DI SINI
searchInput.addEventListener('input', searchTasks);
// Hint: gunakan event 'input' supaya search langsung real-time saat mengetik

// TAMBAHKAN EVENT LISTENER FILTER DI SINI
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        setFilter(filter);
    });
});

 
 // ===== INISIALISASI =====
 // Muat tugas yang tersimpan saat halaman dibuka
loadTasks();
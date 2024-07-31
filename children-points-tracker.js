let pointsData = [];
let taskPoints = {
    "סידור החדר": 5,
    "הכנת שיעורי בית": 10,
    "עזרה בהכנת ארוחת ערב": 8,
    "צחצוח שיניים": 3,
    "קריאת ספר": 7,
    "עזרה לאח/אחות": 6,
    "הליכה עם הכלב": 5,
    "שטיפת כלים": 6,
    "קיפול וסידור כביסה": 7,
    "התנהגות טובה בבית הספר": 15
};

function debug(message) {
    console.log(message);
    document.getElementById('debug').innerHTML += message + '<br>';
}

function addPoints() {
    const child = document.getElementById('childSelect').value;
    const task = document.getElementById('taskSelect').value;
    const points = taskPoints[task];
    const date = new Date().toISOString().split('T')[0];

    pointsData.push({ child, task, points, date });
    updateTable();
    updateSummary();
    saveData();
    debug(`Added points: ${child}, ${task}, ${points}, ${date}`);
}

function updateTable() {
    const table = document.getElementById('pointsTable');
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    
    pointsData.forEach((entry, index) => {
        const row = table.insertRow();
        row.insertCell(0).textContent = entry.child;
        row.insertCell(1).textContent = entry.task;
        row.insertCell(2).textContent = entry.points;
        row.insertCell(3).textContent = entry.date;
        const deleteCell = row.insertCell(4);
        deleteCell.innerHTML = '<span class="deleteRow" onclick="confirmDeleteRow(' + index + ')">❌</span>';
    });
    debug('Table updated');
}

function confirmDeleteRow(index) {
    if (confirm('האם אתה בטוח שברצונך למחוק שורה זו?')) {
        deleteRow(index);
    }
}

function deleteRow(index) {
    pointsData.splice(index, 1);
    updateTable();
    updateSummary();
    saveData();
    debug(`Row deleted at index ${index}`);
}

function updateSummary() {
    const noamTotal = pointsData.filter(entry => entry.child === 'נועם').reduce((sum, entry) => sum + entry.points, 0);
    const amitTotal = pointsData.filter(entry => entry.child === 'עמית').reduce((sum, entry) => sum + entry.points, 0);

    document.getElementById('noamTotal').textContent = noamTotal;
    document.getElementById('amitTotal').textContent = amitTotal;
    document.getElementById('noamMoney').textContent = Math.floor(noamTotal / 100) * 10;
    document.getElementById('amitMoney').textContent = Math.floor(amitTotal / 100) * 10;

    updateProgressBar('noam', noamTotal);
    updateProgressBar('amit', amitTotal);

    updateChart('נועם', 'noamChart');
    updateChart('עמית', 'amitChart');
    debug('Summary updated');
}

function updateProgressBar(child, total) {
    const progress = total % 100;
    const percentage = Math.min(progress, 100);
    document.getElementById(`${child}Progress`).style.width = `${percentage}%`;
    document.getElementById(`${child}ProgressText`).textContent = percentage;
    debug(`Progress bar updated for ${child}: ${percentage}%`);
}

function addNewTask() {
    const newTaskName = document.getElementById('newTaskName').value;
    const newTaskPoints = parseInt(document.getElementById('newTaskPoints').value);

    if (newTaskName && !isNaN(newTaskPoints)) {
        taskPoints[newTaskName] = newTaskPoints;
        updateTaskSelect();
        updateTaskList();
        document.getElementById('newTaskName').value = '';
        document.getElementById('newTaskPoints').value = '';
        alert('המטלה החדשה נוספה בהצלחה!');
        saveData();
        debug(`New task added: ${newTaskName}, ${newTaskPoints} points`);
    } else {
        alert('אנא הזן שם מטלה ומספר נקודות תקין.');
    }
}

function updateTaskSelect() {
    const taskSelect = document.getElementById('taskSelect');
    taskSelect.innerHTML = '';
    for (const [task, points] of Object.entries(taskPoints)) {
        const option = document.createElement('option');
        option.value = task;
        option.textContent = `${task} (${points} נקודות)`;
        taskSelect.appendChild(option);
    }
    debug('Task select updated');
}

function updateTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    for (const [task, points] of Object.entries(taskPoints)) {
        const taskItem = document.createElement('div');
        taskItem.className = 'taskItem';
        taskItem.innerHTML = `
            <span>${task} (${points} נקודות)</span>
            <span class="removeTask" onclick="removeTask('${task}')">❌</span>
        `;
        taskList.appendChild(taskItem);
    }
    debug('Task list updated');
}

function removeTask(task) {
    if (confirm(`האם אתה בטוח שברצונך להסיר את המטלה "${task}"?`)) {
        delete taskPoints[task];
        updateTaskSelect();
        updateTaskList();
        alert('המטלה הוסרה בהצלחה!');
        saveData();
        debug(`Task removed: ${task}`);
    }
}

function toggleSettings() {
    const settings = document.getElementById('settings');
    settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
    debug(`Settings toggled: ${settings.style.display}`);
}

function saveData() {
    localStorage.setItem('pointsData', JSON.stringify(pointsData));
    localStorage.setItem('taskPoints', JSON.stringify(taskPoints));
    debug('Data saved to localStorage');
}

function loadData() {
    const savedPointsData = localStorage.getItem('pointsData');
    const savedTaskPoints = localStorage.getItem('taskPoints');
    
    if (savedPointsData) {
        pointsData = JSON.parse(savedPointsData);
        updateTable();
        updateSummary();
        debug('Points data loaded from localStorage');
    }
    
    if (savedTaskPoints) {
        taskPoints = JSON.parse(savedTaskPoints);
        debug('Task points loaded from localStorage');
    }
    updateTaskSelect();
    updateTaskList();
}

function updateChart(child, chartId) {
    const childData = pointsData.filter(entry => entry.child === child);
    const taskCounts = {};
    childData.forEach(entry => {
        taskCounts[entry.task] = (taskCounts[entry.task] || 0) + 1;
    });

    const data = {
        labels: Object.keys(taskCounts),
        datasets: [{
            data: Object.values(taskCounts),
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
            ]
        }]
    };

    const ctx = document.getElementById(chartId).getContext('2d');
    if (window[chartId]) {
        window[chartId].destroy();
    }
    window[chartId] = new Chart(ctx, {
        type
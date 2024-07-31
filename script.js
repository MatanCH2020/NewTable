(function() {
    const CHILDREN = ['נועם', 'עמית'];
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
        const debugElement = document.getElementById('debug');
        debugElement.textContent += message + '\n';
    }

    function addPoints() {
        const child = document.getElementById('childSelect').value;
        const task = document.getElementById('taskSelect').value;
        const points = taskPoints[task];
        const date = new Date().toISOString().split('T')[0];

        if (!child || !task || isNaN(points) || points <= 0) {
            alert('אנא בחר ילד ומשימה תקינים.');
            return;
        }

        pointsData.push({ child, task, points, date });
        updateTable();
        updateSummary();
        saveData();
        debug(`Added points: ${child}, ${task}, ${points}, ${date}`);
    }

    function updateTable() {
        const tbody = document.querySelector('#pointsTable tbody');
        tbody.innerHTML = '';
        
        pointsData.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(entry.child)}</td>
                <td>${escapeHtml(entry.task)}</td>
                <td>${entry.points}</td>
                <td>${entry.date}</td>
                <td><button class="deleteRow" data-index="${index}">❌</button></td>
            `;
            tbody.appendChild(row);
        });
        debug('Table updated');
    }

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
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
        const summarySection = document.getElementById('summarySection');
        summarySection.innerHTML = '';

        CHILDREN.forEach(child => {
            const childTotal = pointsData.filter(entry => entry.child === child)
                .reduce((sum, entry) => sum + entry.points, 0);
            const money = Math.floor(childTotal / 100) * 10;
            const progress = childTotal % 100;
            const percentage = Math.min(progress, 100);

            const childSummary = document.createElement('div');
            childSummary.className = 'summary-child';
            childSummary.innerHTML = `
                <h3>${child}</h3>
                <p><span id="${child}Total">${childTotal}</span> נקודות (<span id="${child}Money">${money}</span> ₪)</p>
                <div class="progress-bar">
                    <span id="${child}Progress" class="progress-bar-fill" style="width: ${percentage}%;"></span>
                </div>
                <p>התקדמות לפרס הבא: <span id="${child}ProgressText">${percentage}</span>%</p>
                <div class="chart-container">
                    <canvas id="${child}Chart"></canvas>
                </div>
            `;
            summarySection.appendChild(childSummary);

            updateChart(child, `${child}Chart`);
        });

        debug('Summary updated');
    }

    function addNewTask() {
        const newTaskName = document.getElementById('newTaskName').value.trim();
        const newTaskPoints = parseInt(document.getElementById('newTaskPoints').value);

        if (newTaskName && !isNaN(newTaskPoints) && newTaskPoints > 0) {
            taskPoints[newTaskName] = newTaskPoints;
            updateTaskSelect();
            updateTaskList();
            document.getElementById('newTaskName').value = '';
            document.getElementById('newTaskPoints').value = '';
            alert('המטלה החדשה נוספה בהצלחה!');
            saveData();
            debug(`New task added: ${newTaskName}, ${newTaskPoints} points`);
        } else {
            alert('אנא הזן שם מטלה ומספר נקודות חיובי.');
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
                <span>${escapeHtml(task)} (${points} נקודות)</span>
                <button class="removeTask" data-task="${escapeHtml(task)}">❌</button>
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
        try {
            localStorage.setItem('pointsData', JSON.stringify(pointsData));
            localStorage.setItem('taskPoints', JSON.stringify(taskPoints));
            debug('Data saved to localStorage');
        } catch (error) {
            console.error('Failed to save data:', error);
            debug('Failed to save data to localStorage');
        }
    }

    function loadData() {
        try {
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
        } catch (error) {
            console.error('Failed to load data:', error);
            debug('Failed to load data from localStorage');
        }
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
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `התפלגות משימות - ${child}`
                    }
                }
            }
        });
        debug(`Chart updated for ${child}`);
    }

    // Event Listeners
    document.getElementById('addPointsButton').addEventListener('click', addPoints);
    document.getElementById('toggleSettingsButton').addEventListener('click', toggleSettings);
    document.getElementById('addNewTaskButton').addEventListener('click', addNewTask);
    document.getElementById('pointsTable').addEventListener('click', function(e) {
        if (e.target.classList.contains('deleteRow')) {
            confirmDeleteRow(parseInt(e.target.dataset.index));
        }
    });
    document.getElementById('taskList').addEventListener('click', function(e) {
        if (e.target.classList.contains('removeTask')) {
            removeTask(e.target.dataset.task);
        }
    });

    // Initialize
    window.addEventListener('load', function() {
        debug('Page loaded');
        loadData();
        updateTaskSelect();
        updateTaskList();
        updateSummary();
        debug('Initialization complete');
    });
})();

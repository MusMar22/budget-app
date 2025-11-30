// Global o'zgaruvchilar
let budget = {
    baytul_mol: 0,
    oila_uchun: 0,
    talim_uchun: 0,
    biznes_rivoj: 0,
    total_income: 0,
    total_spent: 0
};

let expenses = [];
let notes = [];
let expenseChart, budgetChart;

// Sahifa yuklanganda
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDashboard();
    setupEventListeners();
    loadNotes();
    updateCharts();
});

// Event listener'lar
function setupEventListeners() {
    // Tushum miqdori o'zgarganda budjetni hisoblash
    document.getElementById('incomeAmount').addEventListener('input', calculateBudgetPreview);
    
    // Enter tugmasi bilan xarajat qo'shish
    document.getElementById('expenseDescription').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addExpense();
        }
    });
}

// Bo'limlarni ko'rsatish
function showSection(sectionId) {
    // Barcha bo'limlarni yashirish
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Barcha tugmalarni nofaol qilish
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tanlangan bo'limni ko'rsatish
    document.getElementById(sectionId).classList.add('active');
    
    // Tanlangan tugmani faol qilish
    event.target.classList.add('active');
    
    // Ma'lumotlarni yangilash
    if (sectionId === 'expenses') {
        displayExpenses();
    } else if (sectionId === 'statistics') {
        updateCharts();
        updateStatistics();
    }
}

// Tushum qo'shish
function addIncome() {
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const type = document.getElementById('incomeType').value;
    
    if (!amount || amount <= 0) {
        showAlert('Iltimos, toʻgʻri miqdor kiriting!', 'error');
        return;
    }
    
    budget.total_income += amount;
    
    // Budjetlarni taqsimlash
    budget.baytul_mol += amount * 0.1;
    budget.oila_uchun += amount * 0.3;
    budget.talim_uchun += amount * 0.2;
    budget.biznes_rivoj += amount * 0.4;
    
    // Dashboardni yangilash
    updateDashboard();
    
    // Ma'lumotlarni saqlash
    saveData();
    
    // Formani tozalash
    document.getElementById('incomeAmount').value = '';
    
    showAlert(`✅ ${type === 'monthly' ? 'Oylik' : 'Kunlik'} tushum muvaffaqiyatli qo'shildi!`, 'success');
}

// Budjetni oldindan ko'rsatish
function calculateBudgetPreview() {
    const amount = parseFloat(document.getElementById('incomeAmount').value) || 0;
    
    document.getElementById('previewBaytul').textContent = formatMoney(amount * 0.1);
    document.getElementById('previewOila').textContent = formatMoney(amount * 0.3);
    document.getElementById('previewTalim').textContent = formatMoney(amount * 0.2);
    document.getElementById('previewBiznes').textContent = formatMoney(amount * 0.4);
}

// Xarajat qo'shish
function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value;
    
    if (!amount || amount <= 0) {
        showAlert('Iltimos, toʻgʻri miqdor kiriting!', 'error');
        return;
    }
    
    if (!description) {
        showAlert('Iltimos, xarajat tavsifini kiriting!', 'error');
        return;
    }
    
    // Budjetni tekshirish
    let selectedBudget = 0;
    switch(category) {
        case 'Baytul mol': selectedBudget = budget.baytul_mol; break;
        case 'Oila uchun': selectedBudget = budget.oila_uchun; break;
        case 'Talim uchun': selectedBudget = budget.talim_uchun; break;
        case 'Biznes rivoji uchun': selectedBudget = budget.biznes_rivoj; break;
    }
    
    if (amount > selectedBudget) {
        showAlert(`❌ Budjet yetarli emas! Qolgan miqdor: ${formatMoney(selectedBudget)}`, 'error');
        return;
    }
    
    // Xarajatni qo'shish
    const expense = {
        id: Date.now(),
        date: new Date().toLocaleString('uz-UZ'),
        category: category,
        amount: amount,
        description: description
    };
    
    expenses.push(expense);
    
    // Budjetlarni yangilash
    switch(category) {
        case 'Baytul mol': budget.baytul_mol -= amount; break;
        case 'Oila uchun': budget.oila_uchun -= amount; break;
        case 'Talim uchun': budget.talim_uchun -= amount; break;
        case 'Biznes rivoji uchun': budget.biznes_rivoj -= amount; break;
    }
    
    budget.total_spent += amount;
    
    // Yangilash
    updateDashboard();
    saveData();
    
    // Formani tozalash
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDescription').value = '';
    
    showAlert('✅ Xarajat muvaffaqiyatli qoʻshildi!', 'success');
}

// Dashboardni yangilash
function updateDashboard() {
    document.getElementById('totalIncome').textContent = formatMoney(budget.total_income);
    document.getElementById('totalSpent').textContent = formatMoney(budget.total_spent);
    document.getElementById('remainingBalance').textContent = formatMoney(budget.total_income - budget.total_spent);
    
    // Budjet kartalarini yangilash
    document.getElementById('budgetBaytul').textContent = formatMoney(budget.baytul_mol);
    document.getElementById('budgetOila').textContent = formatMoney(budget.oila_uchun);
    document.getElementById('budgetTalim').textContent = formatMoney(budget.talim_uchun);
    document.getElementById('budgetBiznes').textContent = formatMoney(budget.biznes_rivoj);
}

// Xarajatlarni ko'rsatish
function displayExpenses() {
    const expensesList = document.getElementById('expensesList');
    
    if (expenses.length === 0) {
        expensesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt" style="font-size: 4em; color: #6c757d; margin-bottom: 20px;"></i>
                <h3>Hozircha xarajatlar mavjud emas</h3>
                <p>Birinchi xarajatingizni qo'shing</p>
            </div>
        `;
        return;
    }
    
    expensesList.innerHTML = expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-category">${expense.category}</div>
                <div class="expense-description">${expense.description}</div>
                <div class="expense-date">${expense.date}</div>
            </div>
            <div class="expense-amount">-${formatMoney(expense.amount)}</div>
        </div>
    `).join('');
}

// Eslatma qo'shish
function addNote() {
    const noteText = document.getElementById('noteText').value.trim();
    
    if (!noteText) {
        showAlert('Iltimos, eslatma matnini kiriting!', 'error');
        return;
    }
    
    const note = {
        id: Date.now(),
        date: new Date().toLocaleString('uz-UZ'),
        content: noteText
    };
    
    notes.push(note);
    saveNotes();
    displayNotes();
    
    document.getElementById('noteText').value = '';
    showAlert('✅ Eslatma muvaffaqiyatli saqlandi!', 'success');
}

// Eslatmalarni ko'rsatish
function displayNotes() {
    const notesList = document.getElementById('notesList');
    
    if (notes.length === 0) {
        notesList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">Hozircha eslatmalar mavjud emas</p>';
        return;
    }
    
    notesList.innerHTML = notes.map(note => `
        <div class="note-item">
            <div class="note-date">${note.date}</div>
            <div class="note-content">${note.content}</div>
        </div>
    `).reverse().join('');
}

// Diagrammalarni yangilash
function updateCharts() {
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    const budgetCtx = document.getElementById('budgetChart').getContext('2d');
    
    // Oldingi diagrammalarni yo'q qilish
    if (expenseChart) expenseChart.destroy();
    if (budgetChart) budgetChart.destroy();
    
    // Xarajatlar diagrammasi
    const expenseData = {
        labels: ['Baytul mol', 'Oila uchun', 'Talim uchun', 'Biznes rivoji'],
        datasets: [{
            data: [
                expenses.filter(e => e.category === 'Baytul mol').reduce((sum, e) => sum + e.amount, 0),
                expenses.filter(e => e.category === 'Oila uchun').reduce((sum, e) => sum + e.amount, 0),
                expenses.filter(e => e.category === 'Talim uchun').reduce((sum, e) => sum + e.amount, 0),
                expenses.filter(e => e.category === 'Biznes rivoji uchun').reduce((sum, e) => sum + e.amount, 0)
            ],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
    
    expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: expenseData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
    
    // Budjet diagrammasi
    const budgetData = {
        labels: ['Baytul mol', 'Oila uchun', 'Talim uchun', 'Biznes rivoji'],
        datasets: [{
            label: 'Qolgan Budjet',
            data: [budget.baytul_mol, budget.oila_uchun, budget.talim_uchun, budget.biznes_rivoj],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2
        }]
    };
    
    budgetChart = new Chart(budgetCtx, {
        type: 'bar',
        data: budgetData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatMoney(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

// Statistika yangilash
function updateStatistics() {
    document.getElementById('statsTotalIncome').textContent = formatMoney(budget.total_income);
    document.getElementById('statsTotalSpent').textContent = formatMoney(budget.total_spent);
    document.getElementById('statsRemaining').textContent = formatMoney(budget.total_income - budget.total_spent);
    
    const expensePercent = budget.total_income > 0 ? (budget.total_spent / budget.total_income * 100) : 0;
    document.getElementById('statsExpensePercent').textContent = expensePercent.toFixed(1) + '%';
}

// Format money
function formatMoney(amount) {
    return Math.round(amount).toLocaleString('uz-UZ') + ' soʻm';
}

// Alert ko'rsatish
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Ma'lumotlarni saqlash (LocalStorage ga)
function saveData() {
    const data = {
        budget: budget,
        expenses: expenses
    };
    localStorage.setItem('budgetData', JSON.stringify(data));
}

// Ma'lumotlarni yuklash
function loadData() {
    const saved = localStorage.getItem('budgetData');
    if (saved) {
        const data = JSON.parse(saved);
        budget = data.budget;
        expenses = data.expenses;
    }
}

// Eslatmalarni saqlash
function saveNotes() {
    localStorage.setItem('budgetNotes', JSON.stringify(notes));
}

// Eslatmalarni yuklash
function loadNotes() {
    const saved = localStorage.getItem('budgetNotes');
    if (saved) {
        notes = JSON.parse(saved);
        displayNotes();
    }
}

// CSS for alerts
const style = document.createElement('style');
style.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        max-width: 500px;
    }
    
    .alert-success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 8px;
        padding: 15px;
    }
    
    .alert-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        padding: 15px;
    }
    
    .alert-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .alert-content button {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
    }
    
    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #6c757d;
    }
    
    .empty-state h3 {
        margin-bottom: 10px;
        font-size: 1.5em;
    }
`;
document.head.appendChild(style);
// Dastlabki ma'lumotlar
let sales = JSON.parse(localStorage.getItem('milkSales')) || [];
let nextId = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;

// DOM elementlari
const currentDateEl = document.getElementById('current-date');
const totalAmountEl = document.getElementById('total-amount');
const salesBodyEl = document.getElementById('sales-body');
const emptyRowEl = document.getElementById('empty-row');
const addBtn = document.getElementById('add-btn');
const filterBtn = document.getElementById('filter-btn');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');
const filterOptionsEl = document.getElementById('filter-options');
const filterTypeEl = document.getElementById('filter-type');
const filterDateEl = document.getElementById('filter-date');

// Sana va vaqtni sozlash
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateEl.textContent = now.toLocaleDateString('uz-UZ', options);
}

// Jami miqdorlarni hisoblash
function updateSummary() {
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalSum = sales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
    const totalSales = sales.length;
    const avgPrice = totalSales > 0 ? Math.round(totalSum / totalQuantity) : 0;
    
    document.getElementById('total-quantity').textContent = `${totalQuantity.toFixed(1)} L`;
    document.getElementById('total-sum').textContent = `${totalSum.toLocaleString()} so'm`;
    document.getElementById('total-sales').textContent = totalSales;
    document.getElementById('avg-price').textContent = `${avgPrice.toLocaleString()} so'm`;
    totalAmountEl.textContent = `Jami: ${totalQuantity.toFixed(1)} L`;
}

// Sotuvlar jadvalini yangilash
function renderSalesTable(filteredSales = sales) {
    salesBodyEl.innerHTML = '';
    
    if (filteredSales.length === 0) {
        emptyRowEl.style.display = '';
        salesBodyEl.appendChild(emptyRowEl);
        return;
    }
    
    emptyRowEl.style.display = 'none';
    
    filteredSales.forEach(sale => {
        const row = document.createElement('tr');
        const total = sale.quantity * sale.price;
        
        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${sale.time}</td>
            <td>${sale.quantity} L</td>
            <td>${sale.price.toLocaleString()} so'm</td>
            <td><strong>${total.toLocaleString()} so'm</strong></td>
            <td>${sale.customer || 'Noma\'lum'}</td>
            <td>
                <span class="type-badge ${sale.type}">
                    ${getTypeName(sale.type)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editSale(${sale.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteSale(${sale.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        salesBodyEl.appendChild(row);
    });
}

// Sut turi nomini olish
function getTypeName(type) {
    const types = {
        'sigir': 'Sigir suti',
        'echki': 'Echki suti',
        'qaymoq': 'Qaymoqli sut',
        'pasteriz': 'Pasterizatsiyalangan'
    };
    return types[type] || type;
}

// Yangi sotuv qo'shish
function addSale() {
    const quantity = parseFloat(document.getElementById('quantity').value);
    const price = parseInt(document.getElementById('price').value);
    const customer = document.getElementById('customer').value.trim();
    const type = document.getElementById('type').value;
    const time = document.getElementById('time').value;
    
    if (!quantity || quantity <= 0) {
        alert('Iltimos, miqdorni to\'g\'ri kiriting!');
        return;
    }
    
    if (!price || price <= 0) {
        alert('Iltimos, narxni to\'g\'ri kiriting!');
        return;
    }
    
    const newSale = {
        id: nextId++,
        quantity,
        price,
        customer,
        type,
        time,
        date: new Date().toISOString().split('T')[0]
    };
    
    sales.push(newSale);
    localStorage.setItem('milkSales', JSON.stringify(sales));
    
    // Formani tozalash
    document.getElementById('quantity').value = '';
    document.getElementById('price').value = '';
    document.getElementById('customer').value = '';
    
    updateSummary();
    renderSalesTable();
    
    // Kichik animatsiya
    addBtn.innerHTML = '<i class="fas fa-check"></i> Saqlandi!';
    addBtn.style.background = '#4CAF50';
    setTimeout(() => {
        addBtn.innerHTML = '<i class="fas fa-save"></i> Sotuvni Saqlash';
        addBtn.style.background = '';
    }, 1500);
}

// Sotuvni o'chirish
function deleteSale(id) {
    if (!confirm('Bu sotuvni o\'chirishni xohlaysizmi?')) return;
    
    sales = sales.filter(sale => sale.id !== id);
    localStorage.setItem('milkSales', JSON.stringify(sales));
    updateSummary();
    renderSalesTable();
}

// Sotuvni tahrirlash
function editSale(id) {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;
    
    document.getElementById('quantity').value = sale.quantity;
    document.getElementById('price').value = sale.price;
    document.getElementById('customer').value = sale.customer;
    document.getElementById('type').value = sale.type;
    document.getElementById('time').value = sale.time;
    
    // O'chirish va yangilash
    sales = sales.filter(s => s.id !== id);
    addBtn.innerHTML = '<i class="fas fa-sync"></i> Yangilash';
    addBtn.onclick = function() {
        sale.quantity = parseFloat(document.getElementById('quantity').value);
        sale.price = parseInt(document.getElementById('price').value);
        sale.customer = document.getElementById('customer').value.trim();
        sale.type = document.getElementById('type').value;
        sale.time = document.getElementById('time').value;
        
        sales.push(sale);
        localStorage.setItem('milkSales', JSON.stringify(sales));
        
        updateSummary();
        renderSalesTable();
        
        // Formani qayta tiklash
        document.getElementById('quantity').value = '';
        document.getElementById('price').value = '';
        document.getElementById('customer').value = '';
        document.getElementById('type').value = 'sigir';
        document.getElementById('time').value = '09:00';
        
        addBtn.innerHTML = '<i class="fas fa-save"></i> Sotuvni Saqlash';
        addBtn.onclick = addSale;
        
        alert('Sotuv muvaffaqiyatli yangilandi!');
    };
}

// Filtrlash
function applyFilter() {
    let filtered = sales;
    const type = filterTypeEl.value;
    const date = filterDateEl.value;
    
    if (type !== 'all') {
        filtered = filtered.filter(sale => sale.type === type);
    }
    
    if (date) {
        filtered = filtered.filter(sale => sale.date === date);
    }
    
    renderSalesTable(filtered);
}

// Excel ga eksport qilish
function exportToExcel() {
    if (sales.length === 0) {
        alert('Eksport qilish uchun ma\'lumot yo\'q!');
        return;
    }
    
    let csv = 'ID,Vaqt,Sana,Miqdor (L),Narx,Summa,Mijoz,Turi\n';
    
    sales.forEach(sale => {
        const total = sale.quantity * sale.price;
        const row = [
            sale.id,
            sale.time,
            sale.date,
            sale.quantity,
            sale.price,
            total,
            sale.customer || 'Noma\'lum',
            getTypeName(sale.type)
        ].join(',');
        csv += row + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sut_sotuvlari_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Barcha ma'lumotlarni tozalash
function clearAllData() {
    if (!confirm('BARCHA ma\'lumotlarni o\'chirishni xohlaysizmi? Bu amalni bekor qilib bo\'lmaydi!')) {
        return;
    }
    
    sales = [];
    nextId = 1;
    localStorage.removeItem('milkSales');
    updateSummary();
    renderSalesTable();
    alert('Barcha ma\'lumotlar tozalandi!');
}

// Event listenerlar
addBtn.addEventListener('click', addSale);
filterBtn.addEventListener('click', () => {
    filterOptionsEl.classList.toggle('active');
});
filterTypeEl.addEventListener('change', applyFilter);
filterDateEl.addEventListener('change', applyFilter);
exportBtn.addEventListener('click', exportToExcel);
clearBtn.addEventListener('click', clearAllData);

// Enter tugmasi bilan qo'shish
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
        addSale();
    }
});

// Dastlabki yuklash
updateDateTime();
updateSummary();
renderSalesTable();

// Har 1 daqiqada vaqtni yangilash
setInterval(updateDateTime, 60000);

// Namuna ma'lumotlarni qo'shish (faqat birinchi marta)
if (sales.length === 0) {
    const sampleData = [
        { id: 1, quantity: 2.5, price: 8000, customer: "Ali Valiyev", type: "sigir", time: "08:30", date: new Date().toISOString().split('T')[0] },
        { id: 2, quantity: 1.0, price: 10000, customer: "Malika Sobirova", type: "echki", time: "09:15", date: new Date().toISOString().split('T')[0] },
        { id: 3, quantity: 3.0, price: 7500, customer: "", type: "sigir", time: "10:45", date: new Date().toISOString().split('T')[0] },
        { id: 4, quantity: 0.5, price: 12000, customer: "Javlon Abdullayev", type: "qaymoq", time: "11:20", date: new Date().toISOString().split('T')[0] }
    ];
    
    sales = sampleData;
    nextId = 5;
    localStorage.setItem('milkSales', JSON.stringify(sales));
    updateSummary();
    renderSalesTable();
}
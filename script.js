// Get elements

const expenseForm = document.getElementById("expenseForm");

const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const dateInput = document.getElementById("date");

const expenseList = document.getElementById("expenseList");

const totalExpenses = document.getElementById("totalExpenses");
const monthlyExpenses = document.getElementById("monthlyExpenses");
const transactionCount = document.getElementById("transactionCount");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");


// Load expenses from browser storage

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];


// Set today's date

dateInput.value = new Date().toISOString().split("T")[0];


// Save expenses

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


// Add expense

expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const expense = {

        id: Date.now(),

        amount: Number(amountInput.value),

        category: categoryInput.value,

        description: descriptionInput.value,

        date: dateInput.value

    };


    expenses.push(expense);


    saveExpenses();


    expenseForm.reset();


    dateInput.value =
        new Date().toISOString().split("T")[0];


    updateDashboard();

    displayExpenses();

    updateCharts();

});


// Calculate total expenses

function calculateTotal() {

    return expenses.reduce(
        (total, expense) => total + expense.amount,
        0
    );

}


// Calculate current month's expenses

function calculateMonthlyTotal() {

    const now = new Date();

    const currentMonth = now.getMonth();

    const currentYear = now.getFullYear();


    return expenses

        .filter(expense => {

            const date = new Date(expense.date);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        })

        .reduce(
            (total, expense) =>
                total + expense.amount,
            0
        );

}


// Update dashboard

function updateDashboard() {

    totalExpenses.textContent =
        "₹" + calculateTotal().toLocaleString("en-IN");


    monthlyExpenses.textContent =
        "₹" + calculateMonthlyTotal()
            .toLocaleString("en-IN");


    transactionCount.textContent =
        expenses.length;

}


// Display expenses

function displayExpenses() {

    const searchTerm =
        searchInput.value.toLowerCase();

    const selectedCategory =
        filterCategory.value;


    const filteredExpenses =
        expenses.filter(expense => {

            const matchesSearch =
                expense.description
                    .toLowerCase()
                    .includes(searchTerm) ||

                expense.category
                    .toLowerCase()
                    .includes(searchTerm);


            const matchesCategory =
                selectedCategory === "All" ||
                expense.category === selectedCategory;


            return matchesSearch && matchesCategory;

        });


    expenseList.innerHTML = "";


    if (filteredExpenses.length === 0) {

        expenseList.innerHTML =
            "<p>No expenses found.</p>";

        return;

    }


    // Show newest expenses first

    filteredExpenses
        .sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        )
        .forEach(expense => {

            const div =
                document.createElement("div");

            div.className = "expense-item";


            div.innerHTML = `

                <div class="expense-info">

                    <h3>
                        ${expense.description}
                    </h3>

                    <p>
                        ${expense.category}
                        •
                        ${expense.date}
                    </p>

                </div>


                <div>

                    <span class="expense-amount">

                        ₹${expense.amount
                            .toLocaleString("en-IN")}

                    </span>


                    <button
                        class="delete-btn"
                        onclick="deleteExpense(${expense.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            expenseList.appendChild(div);

        });

}


// Delete expense

function deleteExpense(id) {

    expenses =
        expenses.filter(expense =>
            expense.id !== id
        );


    saveExpenses();

    updateDashboard();

    displayExpenses();

    updateCharts();

}


// Search

searchInput.addEventListener(
    "input",
    displayExpenses
);


// Category filter

filterCategory.addEventListener(
    "change",
    displayExpenses
);


// Category chart

let categoryChart;


// Monthly chart

let monthlyChart;


// Update charts

function updateCharts() {

    updateCategoryChart();

    updateMonthlyChart();

}


// Category chart

function updateCategoryChart() {

    const categoryTotals = {};


    expenses.forEach(expense => {

        if (!categoryTotals[expense.category]) {

            categoryTotals[expense.category] = 0;

        }


        categoryTotals[expense.category] +=
            expense.amount;

    });


    const labels =
        Object.keys(categoryTotals);

    const values =
        Object.values(categoryTotals);


    if (categoryChart) {

        categoryChart.destroy();

    }


    const ctx =
        document
            .getElementById("categoryChart")
            .getContext("2d");


    categoryChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: [

                    "#4f46e5",
                    "#22c55e",
                    "#f97316",
                    "#ef4444",
                    "#06b6d4",
                    "#eab308",
                    "#8b5cf6",
                    "#64748b"

                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}


// Monthly chart

function updateMonthlyChart() {

    const monthlyTotals = {};


    expenses.forEach(expense => {

        const date =
            new Date(expense.date);


        const month =
            date.toLocaleString(
                "default",
                {
                    month: "short",
                    year: "numeric"
                }
            );


        if (!monthlyTotals[month]) {

            monthlyTotals[month] = 0;

        }


        monthlyTotals[month] +=
            expense.amount;

    });


    const labels =
        Object.keys(monthlyTotals);

    const values =
        Object.values(monthlyTotals);


    if (monthlyChart) {

        monthlyChart.destroy();

    }


    const ctx =
        document
            .getElementById("monthlyChart")
            .getContext("2d");


    monthlyChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label: "Monthly Expenses",

                data: values,

                backgroundColor:
                    "#4f46e5"

            }]

        },

        options: {

            responsive: true,

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}


// Initial page load

updateDashboard();

displayExpenses();

updateCharts();

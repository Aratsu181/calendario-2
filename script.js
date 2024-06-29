document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const vacationForm = document.getElementById("vacationForm");
    const vacationList = document.getElementById("vacationList");
    const calendarContainer = document.getElementById("calendar-container");
    const yearSelect = document.getElementById("year");
    const currentYear = new Date().getFullYear();
    
    yearSelect.value = currentYear;  // Set the current year as selected by default

    // Load initial calendar
    updateCalendar(currentYear);

    // Generate a random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Load vacations from localStorage when the page loads
    loadVacations();

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const adminPassword = document.getElementById("adminPassword").value;
        if (adminPassword === "admin123") {
            loginForm.style.display = "none";
            vacationForm.style.display = "block";
        } else {
            alert("Contraseña incorrecta");
        }
    });

    vacationForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const role = document.getElementById("role").value; // Get the role
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const year = yearSelect.value;
        const color = getRandomColor(); // Assign a random color

        // Save vacations with the role and color
        saveVacation(name, role, startDate, endDate, year, color);

        // Clear the form
        vacationForm.reset();

        // Reload vacations
        loadVacations();
    });

    function saveVacation(name, role, startDate, endDate, year, color) {
        let vacations = JSON.parse(localStorage.getItem("vacations") || "{}");
        if (!vacations[year]) {
            vacations[year] = [];
        }
        vacations[year].push({ name, role, startDate, endDate, color });
        localStorage.setItem("vacations", JSON.stringify(vacations));
    }

    function loadVacations() {
        let vacations = JSON.parse(localStorage.getItem("vacations") || "{}");
        vacationList.innerHTML = "";
        Object.keys(vacations).forEach(year => {
            vacations[year].forEach((vacation, index) => {
                let li = document.createElement("li");
                li.innerHTML = `<span class="color-box" style="background-color:${vacation.color};"></span>${vacation.name} (${vacation.role}): ${vacation.startDate} - ${vacation.endDate} (${year})`;
                let deleteButton = document.createElement("button");
                deleteButton.textContent = "Eliminar";
                deleteButton.onclick = () => deleteVacation(year, index);
                li.appendChild(deleteButton);
                vacationList.appendChild(li);
            });
        });
        updateCalendar(yearSelect.value);  // Update calendar with current selected year
    }

    function deleteVacation(year, index) {
        let vacations = JSON.parse(localStorage.getItem("vacations") || "{}");
        vacations[year].splice(index, 1);
        if (vacations[year].length === 0) {
            delete vacations[year];
        }
        localStorage.setItem("vacations", JSON.stringify(vacations));
        loadVacations();
    }

    yearSelect.addEventListener("change", function () {
        updateCalendar(this.value);
    });

    function updateCalendar(year) {
        if (!year) return;
        let vacations = JSON.parse(localStorage.getItem("vacations") || "{}")[year] || [];
        calendarContainer.innerHTML = "";
        const months = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        for (let month = 0; month < 12; month++) {
            let monthContainer = document.createElement("div");
            monthContainer.className = "month-container";

            let monthTitle = document.createElement("h3");
            monthTitle.textContent = months[month];
            monthContainer.appendChild(monthTitle);

            let table = document.createElement("table");
            let thead = document.createElement("thead");
            let tbody = document.createElement("tbody");

            // Create table header
            let headerRow = document.createElement("tr");
            ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].forEach(day => {
                let th = document.createElement("th");
                th.textContent = day;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create days of the month
            let date = new Date(year, month, 1);
            let firstDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Monday first
            let row = document.createElement("tr");

            // Fill empty cells before first day of the month
            for (let i = 0; i < firstDayIndex; i++) {
                let emptyCell = document.createElement("td");
                row.appendChild(emptyCell);
            }

            for (let day = 1; day <= daysInMonth[month]; day++) {
                if (row.children.length === 7) {
                    tbody.appendChild(row);
                    row = document.createElement("tr");
                }

                let cell = document.createElement("td");
                cell.textContent = day;

                let vacationColors = vacations.filter(vacation => {
                    let startDate = new Date(vacation.startDate);
                    let endDate = new Date(vacation.endDate);
                    let currentDate = new Date(year, month, day);
                    return currentDate >= startDate && currentDate <= endDate;
                }).map(vacation => vacation.color);

                if (vacationColors.length > 0) {
                    if (vacationColors.length === 1) {
                        cell.style.backgroundColor = vacationColors[0];
                    } else {
                        let gradient = vacationColors.map((color, index) => {
                            let position = (index + 1) * 100 / vacationColors.length;
                            return `${color} ${position}%`;
                        }).join(', ');
                        cell.style.background = `linear-gradient(to right, ${gradient})`;
                    }
                }

                row.appendChild(cell);
            }

            // Append incomplete row at the end
            if (row.children.length > 0) {
                tbody.appendChild(row);
            }

            table.appendChild(tbody);
            monthContainer.appendChild(table);
            calendarContainer.appendChild(monthContainer);
        }
    }
});

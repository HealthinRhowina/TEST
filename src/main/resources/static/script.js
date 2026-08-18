const API_URL = "/api/employees";

const employeeForm = document.getElementById("employeeForm");

const submitButton = document.getElementById("submitButton");

const cancelButton = document.getElementById("cancelButton");

const message = document.getElementById("message");

let editingEmployeeId = null;


// ===============================
// CREATE / UPDATE EMPLOYEE
// ===============================

employeeForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const employee = {

        firstName: document.getElementById("firstName").value,

        lastName: document.getElementById("lastName").value,

        email: document.getElementById("email").value,

        phone: document.getElementById("phone").value,

        department: document.getElementById("department").value
    };


    try {

        let response;

        // UPDATE
        if (editingEmployeeId !== null) {

            response = await fetch(
                `${API_URL}/${editingEmployeeId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(employee)
                }
            );

        }

        // CREATE
        else {

            response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(employee)
            });
        }


        if (!response.ok) {
            throw new Error("Request failed");
        }


        if (editingEmployeeId !== null) {

            showMessage("Employee updated successfully!");

        } else {

            showMessage("Employee registered successfully!");
        }


        resetForm();

        loadEmployees();


    } catch (error) {

        console.error(error);

        showMessage("Something went wrong.", true);
    }

});


// ===============================
// LOAD EMPLOYEES
// ===============================

async function loadEmployees() {

    try {

        const response = await fetch(API_URL);

        const employees = await response.json();

        const tableBody =
            document.getElementById("employeeTableBody");

        tableBody.innerHTML = "";


        employees.forEach(employee => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${employee.id}</td>

                <td>
                    ${employee.firstName}
                    ${employee.lastName}
                </td>

                <td>${employee.email}</td>

                <td>${employee.phone}</td>

                <td>${employee.department}</td>

                <td>

                    <button
                        class="edit-button"
                        onclick="editEmployee(${employee.id})">
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteEmployee(${employee.id})">
                        Delete
                    </button>

                </td>
            `;

            tableBody.appendChild(row);
        });


    } catch (error) {

        console.error("Error loading employees:", error);
    }
}


// ===============================
// EDIT EMPLOYEE
// ===============================

async function editEmployee(id) {

    try {

        const response =
            await fetch(`${API_URL}/${id}`);

        if (!response.ok) {

            throw new Error("Employee not found");
        }

        const employee =
            await response.json();


        document.getElementById("firstName").value =
            employee.firstName;

        document.getElementById("lastName").value =
            employee.lastName;

        document.getElementById("email").value =
            employee.email;

        document.getElementById("phone").value =
            employee.phone;

        document.getElementById("department").value =
            employee.department;


        editingEmployeeId = id;


        submitButton.textContent = "Update Employee";

        cancelButton.style.display = "block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        showMessage("Unable to load employee.", true);
    }
}


// ===============================
// DELETE EMPLOYEE
// ===============================

async function deleteEmployee(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this employee?");


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/${id}`, {

                method: "DELETE"
            });


        if (!response.ok) {

            throw new Error("Delete failed");
        }


        showMessage("Employee deleted successfully!");

        loadEmployees();


    } catch (error) {

        console.error(error);

        showMessage("Unable to delete employee.", true);
    }
}


// ===============================
// CANCEL EDIT
// ===============================

cancelButton.addEventListener("click", function () {

    resetForm();

});


// ===============================
// RESET FORM
// ===============================

function resetForm() {

    employeeForm.reset();

    editingEmployeeId = null;

    submitButton.textContent =
        "Register Employee";

    cancelButton.style.display =
        "none";
}


// ===============================
// MESSAGE
// ===============================

function showMessage(text, error = false) {

    message.textContent = text;

    message.className =
        error ? "error-message" : "success-message";
}


// ===============================
// INITIAL LOAD
// ===============================

loadEmployees();
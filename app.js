let currentUser = null;
let requests = [];

// CREATE - Submit a new service request
document.getElementById("requestForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const requesterName =
            document.getElementById("requesterName")
                .value
                .trim();

        const department =
            document.getElementById("department")
                .value
                .trim();

        const category =
            document.getElementById("category")
                .value;

        const description =
            document.getElementById("description")
                .value
                .trim();

        const priority =
            document.getElementById("priority")
                .value;

        const requestMessage =
            document.getElementById("requestMessage");


        // Basic validation
        if (!requesterName) {
            requestMessage.textContent =
                "Requester name is required.";
            return;
        }

        if (!department) {
            requestMessage.textContent =
                "Department is required.";
            return;
        }

        if (!category) {
            requestMessage.textContent =
                "Please select a category.";
            return;
        }

        if (description.length < 10) {
            requestMessage.textContent =
                "Description must contain sufficient information.";
            return;
        }

        if (!["Low", "Medium", "High"].includes(priority)) {
            requestMessage.textContent =
                "Please select a valid priority.";
            return;
        }


        requestMessage.textContent =
            "Saving request...";


        // Insert into Supabase
        const { data, error } =
            await supabaseClient
                .from("service_requests")
                .insert([
                    {
                        requester_name: requesterName,
                        department: department,
                        category: category,
                        description: description,
                        priority: priority,

                        // BR-06
                        status: "Pending",

                        // BR-07 / RLS
                        user_id: currentUser.id
                    }
                ])
                .select();


        if (error) {

            console.error(error);

            requestMessage.textContent =
                "Error saving request: " +
                error.message;

            return;
        }


        requestMessage.textContent =
            "Request submitted successfully!";


        // Clear form
        document.getElementById("requestForm").reset();


        // Reload data and dashboard
        await loadRequests();


        // Clear success message after a few seconds
        setTimeout(function () {

            requestMessage.textContent = "";

        }, 3000);

    });
// Start application
async function initializeApp() {

    currentUser = await checkUser();

    if (!currentUser) {
        return;
    }

    document.getElementById("userEmail").textContent =
        currentUser.email;

    await loadRequests();
}


// READ - Get requests from Supabase
async function loadRequests() {

    const { data, error } = await supabaseClient
        .from("service_requests")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(error);

        alert(
            "Unable to load service requests: " +
            error.message
        );

        return;
    }

    requests = data || [];

    updateDashboard();

    displayRequests();
}


// DASHBOARD
function updateDashboard() {

    const total = requests.length;

    const pending = requests.filter(
        request => request.status === "Pending"
    ).length;

    const inProgress = requests.filter(
        request => request.status === "In Progress"
    ).length;

    const completed = requests.filter(
        request => request.status === "Completed"
    ).length;


    document.getElementById("totalRequests").textContent =
        total;

    document.getElementById("pendingRequests").textContent =
        pending;

    document.getElementById("inProgressRequests").textContent =
        inProgress;

    document.getElementById("completedRequests").textContent =
        completed;
}


// DISPLAY TABLE
function displayRequests() {

    const tableBody =
        document.getElementById("requestTableBody");

    tableBody.innerHTML = "";


    const search =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    const status =
        document.getElementById("statusFilter").value;


    const priority =
        document.getElementById("priorityFilter").value;


    const filteredRequests = requests.filter(request => {

        const matchesSearch =
            request.requester_name
                .toLowerCase()
                .includes(search)

            ||

            request.description
                .toLowerCase()
                .includes(search);


        const matchesStatus =
            status === "All" ||
            request.status === status;


        const matchesPriority =
            priority === "All" ||
            request.priority === priority;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );

    });


    filteredRequests.forEach(request => {

        const row =
            document.createElement("tr");


        const date =
            new Date(request.created_at)
                .toLocaleDateString();


        row.innerHTML = `

            <td>${request.id}</td>

            <td>${request.requester_name}</td>

            <td>${request.department}</td>

            <td>${request.category}</td>

            <td>${request.priority}</td>

            <td>${request.status}</td>

            <td>${date}</td>

            <td>

                <button
                    onclick="editRequest(${request.id})"
                >
                    Edit
                </button>

                <button
                    onclick="deleteRequest(${request.id})"
                >
                    Delete
                </button>

            </td>
        `;


        tableBody.appendChild(row);

    });

}


// Search
document.getElementById("searchInput")
    .addEventListener(
        "input",
        displayRequests
    );


// Status filter
document.getElementById("statusFilter")
    .addEventListener(
        "change",
        displayRequests
    );


// Priority filter
document.getElementById("priorityFilter")
    .addEventListener(
        "change",
        displayRequests
    );


// Start application
initializeApp();
Compose
Write to Kim Quicos

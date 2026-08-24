let incidents = [];

function incidentCard(incident) {
  return `
    <button class="incident-card" data-id="${incident.id}">
      <span class="priority priority-${incident.priority_label.toLowerCase()}">${incident.priority_label} · ${incident.priority_score}</span>
      <strong>${incident.category.replaceAll("_", " ")} · #${incident.id}</strong>
      <small>${incident.ward} · ${incident.status.replaceAll("_", " ")}</small>
      <p>${incident.description}</p>
    </button>`;
}

async function loadQueue() {
  const status = document.getElementById("status-filter").value;
  const category = document.getElementById("category-filter").value;
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (category) query.set("category", category);
  const result = await apiRequest(`/api/incidents?${query}`);
  incidents = result.items;
  document.getElementById("incident-list").innerHTML = incidents.map(incidentCard).join("") || "No incidents match this filter.";
  document.querySelectorAll(".incident-card").forEach((button) => button.addEventListener("click", () => showDetail(button.dataset.id)));
}

async function showDetail(id) {
  const incident = incidents.find((item) => String(item.id) === String(id));
  document.getElementById("incident-detail").innerHTML = `
    <h2>${incident.category.replaceAll("_", " ")}</h2>
    <p>${incident.description}</p>
    <p><strong>Priority:</strong> ${incident.priority_score}/100</p>
    <p><strong>Department:</strong> ${incident.department_name || "Unassigned"}</p>
    <form id="update-form">
      <select name="status"><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select>
      <textarea name="note" required minlength="3" placeholder="Record the action taken."></textarea>
      <button class="primary-button">Save update</button>
    </form>`;
}

document.getElementById("status-filter").addEventListener("change", loadQueue);
document.getElementById("category-filter").addEventListener("change", loadQueue);
loadQueue();
const form = document.getElementById("incident-form");
const message = document.getElementById("form-message");

document.getElementById("location-button").addEventListener("click", () => {
  if (!navigator.geolocation) {
    message.textContent = "Location services are unavailable. Enter coordinates manually.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      form.latitude.value = coords.latitude.toFixed(6);
      form.longitude.value = coords.longitude.toFixed(6);
      message.textContent = "Location added. Please confirm it describes the incident.";
    },
    () => { message.textContent = "Location was not shared. Enter coordinates manually."; },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  message.textContent = "Submitting your report…";
  try {
    const result = await apiRequest("/api/incidents", { method: "POST", body: new FormData(form) });
    form.reset();
    message.textContent = `Report submitted. Your incident number is #${result.incident_id}.`;
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
/**
 * SANJAYA Ticket Tracking Logic
 * PRD Section 6.3: Know what happens next.
 * Implements all 6 first-class states: Empty, Loading, Success,
 * Malformed, Not Found, and Unavailable.
 */

document.addEventListener("DOMContentLoaded", () => {
  initTracker();
});

function initTracker() {
  const form = document.getElementById("ticket-search-form");
  const input = document.getElementById("ticket-search-input");
  const sampleChips = document.querySelectorAll(".sample-chip");

  // State Containers
  const states = {
    empty: document.getElementById("tracker-state-empty"),
    loading: document.getElementById("tracker-state-loading"),
    success: document.getElementById("tracker-state-success"),
    malformed: document.getElementById("tracker-state-malformed"),
    notFound: document.getElementById("tracker-state-notfound"),
    unavailable: document.getElementById("tracker-state-unavailable")
  };

  function switchState(activeStateName) {
    Object.keys(states).forEach((key) => {
      if (states[key]) {
        states[key].classList.toggle("is-active", key === activeStateName);
      }
    });
  }

  // Handle Form Submit
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input?.value.trim() || "";
    lookupTicket(query);
  });

  // Handle Quick Sample Chips
  sampleChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const ticketId = chip.dataset.ticket;
      if (input) input.value = ticketId;
      lookupTicket(ticketId);
    });
  });

  // Check URL parameters for ?ticket=XXXX
  const urlParams = new URLSearchParams(window.location.search);
  const ticketFromUrl = urlParams.get("ticket") || urlParams.get("id");
  if (ticketFromUrl) {
    if (input) input.value = ticketFromUrl;
    lookupTicket(ticketFromUrl);
  } else {
    switchState("empty");
  }

  async function lookupTicket(ticketId) {
    if (!ticketId) {
      switchState("empty");
      return;
    }

    // Validation for malformed ticket
    const cleanId = ticketId.trim().toUpperCase();
    if (cleanId.length < 5 || !/^[A-Z0-9-]+$/.test(cleanId)) {
      switchState("malformed");
      return;
    }

    // Trigger loading state
    switchState("loading");

    // Artificial short delay for composed motion / realistic feel (250ms)
    await new Promise((r) => setTimeout(r, 280));

    try {
      const ticket = await SANJAYA_ADAPTER.getTicket(cleanId);

      if (!ticket) {
        // Set searched ticket in not-found view
        const nfTicket = document.getElementById("notfound-ticket-display");
        if (nfTicket) nfTicket.textContent = cleanId;
        switchState("notFound");
        return;
      }

      // Render Ticket Details
      renderTicketSuccess(ticket);
      switchState("success");

    } catch (error) {
      console.error("Tracker lookup error:", error);
      switchState("unavailable");
    }
  }

  function renderTicketSuccess(t) {
    // Ticket Header & Meta
    const idEl = document.getElementById("ticket-result-id");
    const badgeEl = document.getElementById("ticket-result-badge");
    const categoryEl = document.getElementById("ticket-result-category");
    const wardEl = document.getElementById("ticket-result-ward");
    const deptEl = document.getElementById("ticket-result-dept");
    const updatedEl = document.getElementById("ticket-result-updated");
    const descEl = document.getElementById("ticket-result-desc");
    const nextStepEl = document.getElementById("ticket-result-nextstep");
    const timelineContainer = document.getElementById("ticket-result-timeline");
    const prototypeNote = document.getElementById("ticket-prototype-notice");

    if (idEl) idEl.textContent = t.id;
    if (badgeEl) {
      badgeEl.className = `badge ${t.badgeClass || "badge-received"}`;
      badgeEl.innerHTML = `<span class="badge-dot"></span><span>${t.statusLabel}</span>`;
    }
    if (categoryEl) categoryEl.textContent = t.category;
    if (wardEl) wardEl.textContent = t.location || t.ward;
    if (deptEl) deptEl.textContent = t.department;
    if (updatedEl) updatedEl.textContent = t.updatedAt || t.reportedAt;
    if (descEl) descEl.textContent = t.description;
    if (nextStepEl) nextStepEl.textContent = t.nextStep || "Verification underway.";

    // Render Timeline
    if (timelineContainer && t.timeline) {
      timelineContainer.innerHTML = t.timeline.map((step) => `
        <div class="timeline-step is-${step.status}">
          <div class="timeline-node">
            ${step.status === "done" ? "✓" : step.status === "current" ? "•" : ""}
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h4 class="timeline-title">${step.title}</h4>
              <span class="timeline-time">${step.time}</span>
            </div>
            <p class="timeline-desc">${step.detail}</p>
          </div>
        </div>
      `).join("");
    }

    if (prototypeNote) {
      prototypeNote.textContent = t.source === "live_api"
        ? "Connected Live Database: This status is synchronized with the municipal operations desk."
        : "Representative Prototype Record: Data structured according to municipal workflow standards.";
    }
  }
}

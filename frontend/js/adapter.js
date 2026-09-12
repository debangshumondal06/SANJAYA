/**
 * SANJAYA Data Adapter Layer
 * PRD Section 9: Isolates data access behind small frontend adapters.
 * Gracefully attempts backend API hooks if connected, and seamlessly falls back
 * to local fixtures and localStorage in prototype mode.
 */

const SANJAYA_ADAPTER = {
  LOCAL_STORAGE_KEY: "sanjaya_saved_reports_v2",

  /**
   * Look up a ticket by identifier.
   * Supports both sample fixtures, user-submitted local reports, and live API mapping.
   */
  async getTicket(ticketId) {
    if (!ticketId) return null;
    const cleanId = ticketId.trim().toUpperCase();

    // 1. Check local storage for resident-submitted reports
    const localReports = this._getLocalReports();
    if (localReports[cleanId]) {
      return {
        ...localReports[cleanId],
        source: "local_prototype",
        isExample: false
      };
    }

    // 2. Check predefined rich fixtures
    if (SANJAYA_DATA.tickets[cleanId]) {
      return {
        ...SANJAYA_DATA.tickets[cleanId],
        source: "fixture_example",
        isExample: true
      };
    }

    // 3. Attempt live backend check if format looks like incident ID (e.g. numeric or SNY-000001)
    const numericMatch = cleanId.match(/(\d+)$/);
    if (numericMatch) {
      const incidentId = parseInt(numericMatch[1], 10);
      try {
        const response = await fetch(`/api/incidents`, { signal: AbortSignal.timeout(1500) });
        if (response.ok) {
          const json = await response.json();
          const found = (json.items || []).find(item => item.id === incidentId);
          if (found) {
            return this._mapBackendIncidentToTicket(found);
          }
        }
      } catch (err) {
        // Backend not running or timeout; ignore in static mode
      }
    }

    return null;
  },

  /**
   * Submit a new civic incident report.
   * Attempts live backend POST /api/incidents if available;
   * Otherwise falls back gracefully to a fully structured prototype ticket saved in localStorage.
   */
  async submitReport(data) {
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const fallbackTicketId = `SJ-${year}-${randomHex}`;

    let connectedSuccess = false;
    let finalTicketId = fallbackTicketId;

    // Try backend API hook if available
    try {
      const formData = new FormData();
      formData.append("category", this._mapCategoryToBackend(data.category));
      formData.append("description", data.description || "No description provided");
      formData.append("ward", data.ward || "Ward 01");
      formData.append("latitude", String(data.latitude || 22.5726));
      formData.append("longitude", String(data.longitude || 88.3639));
      formData.append("severity", data.category === "water" ? "high" : "medium");

      if (data.file) {
        formData.append("evidence", data.file);
      }

      const response = await fetch("/api/incidents", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.incident_id) {
          finalTicketId = `SNY-${String(result.incident_id).padStart(6, "0")}`;
          connectedSuccess = true;
        }
      }
    } catch (e) {
      // Backend not running; operate in prototype mode
      connectedSuccess = false;
    }

    // Construct standardized ticket record
    const categoryNames = {
      roads: "Roads & Pavements",
      waste: "Solid Waste Management",
      water: "Drainage & Waterlogging",
      lighting: "Street Lighting",
      parks: "Public Spaces & Parks",
      other: "General Civic Matter"
    };

    const departmentMap = {
      roads: "Road Infrastructure & Asphalt Wing",
      waste: "Solid Waste Conservancy Directorate",
      water: "Sewerage & Drainage Division",
      lighting: "Public Lighting & Electrical Wing",
      parks: "Parks & Urban Greenery Directorate",
      other: "Municipal Citizen Redressal Cell"
    };

    const newTicket = {
      id: finalTicketId,
      category: categoryNames[data.category] || "Civic Incident",
      subcategory: data.subcategory || "Citizen report",
      status: "received",
      statusLabel: "Received",
      badgeClass: "badge-received",
      location: data.locationText || `${data.ward || "Ward 14"}, Geotagged site`,
      ward: data.ward || "Ward 14",
      reportedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      updatedAt: "Just now",
      department: departmentMap[data.category] || "Municipal Citizen Redressal Cell",
      nextStep: "Jurisdiction check and de-duplication review by regional duty coordinator",
      description: data.description,
      evidence: data.fileName ? `1 attachment (${data.fileName})` : "Text & location details provided",
      connected: connectedSuccess,
      source: connectedSuccess ? "live_api" : "local_prototype",
      timeline: [
        {
          phase: "Received",
          title: "Report received & authenticated",
          time: "Just now",
          detail: connectedSuccess 
            ? "Saved directly to municipal incident registry. Awaiting duty officer assignment." 
            : "Prototype signal generated and recorded in browser session storage.",
          status: "done"
        },
        {
          phase: "Being reviewed",
          title: "Jurisdictional review & de-duplication",
          time: "Next step (within 2-4 hours)",
          detail: "Coordinator will review location coordinates and check against open work orders.",
          status: "current"
        },
        {
          phase: "Sent to responsible team",
          title: "Department dispatch",
          time: "Upcoming",
          detail: `Will be routed to ${departmentMap[data.category] || "field unit"}.`,
          status: "pending"
        },
        {
          phase: "Work in progress",
          title: "Field team action",
          time: "Upcoming",
          detail: "Contractor or municipal crew mobilization.",
          status: "pending"
        },
        {
          phase: "Resolved",
          title: "Inspection and closure",
          time: "Upcoming",
          detail: "Completion log with verification photo.",
          status: "pending"
        }
      ]
    };

    // Save to localStorage
    this._saveLocalReport(newTicket);

    return newTicket;
  },

  _getLocalReports() {
    try {
      return JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  },

  _saveLocalReport(ticket) {
    try {
      const reports = this._getLocalReports();
      reports[ticket.id] = ticket;
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  },

  _mapCategoryToBackend(cat) {
    if (cat === "waste") return "garbage_overflow";
    if (cat === "water") return "waterlogging";
    return "pothole";
  },

  _mapBackendIncidentToTicket(item) {
    const statusMap = {
      submitted: { label: "Received", class: "badge-received", stepIndex: 0 },
      under_review: { label: "Being reviewed", class: "badge-review", stepIndex: 1 },
      assigned: { label: "Sent to responsible team", class: "badge-assigned", stepIndex: 2 },
      in_progress: { label: "Work in progress", class: "badge-progress", stepIndex: 3 },
      resolved: { label: "Resolved", class: "badge-resolved", stepIndex: 4 }
    };

    const statusInfo = statusMap[item.status] || statusMap.submitted;

    return {
      id: `SNY-${String(item.id).padStart(6, "0")}`,
      category: (item.category || "Incident").replace("_", " ").toUpperCase(),
      status: item.status,
      statusLabel: statusInfo.label,
      badgeClass: statusInfo.class,
      location: item.ward ? `${item.ward}` : "Geotagged site",
      ward: item.ward || "Unassigned",
      reportedAt: item.created_at || "Recent",
      updatedAt: item.updated_at || "Recent",
      department: item.department_name || "Assigned Department",
      nextStep: "Action logged by duty desk",
      description: item.description,
      source: "live_api",
      timeline: [
        { phase: "Received", title: "Incident filed", time: item.created_at || "Done", status: "done", detail: "Entered municipal database." },
        { phase: "Being reviewed", title: "Review & Triage", time: "Completed", status: statusInfo.stepIndex >= 1 ? "done" : "pending", detail: "Coordinator priority scored." },
        { phase: "Sent to responsible team", title: "Department assignment", time: "Completed", status: statusInfo.stepIndex >= 2 ? "done" : "pending", detail: item.department_name || "Department queue" },
        { phase: "Work in progress", title: "Field remediation", time: "In Progress", status: statusInfo.stepIndex >= 3 ? "done" : "pending", detail: "Work order active" },
        { phase: "Resolved", title: "Final sign-off", time: item.updated_at, status: statusInfo.stepIndex >= 4 ? "done" : "pending", detail: "Resolution verified" }
      ]
    };
  }
};

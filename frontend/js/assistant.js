/**
 * SANJAYA Conversational Assistant Script
 * PRD Section 6.7: Friendly, language-ready guided assistant shell,
 * suggested prompt chips, interactive speech synthesis and recognition.
 */

document.addEventListener("DOMContentLoaded", () => {
  initAssistant();
});

function initAssistant() {
  const messagesContainer = document.getElementById("chat-messages");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");
  const micBtn = document.getElementById("chat-mic-btn");
  const promptChips = document.querySelectorAll(".prompt-chip");

  let activeLang = "en";

  // Knowledge base responses for typical civic queries (English only)
  const knowledgeBase = {
    en: {
      default: "I understand. As SANJAYA's civic assistant, I can guide you through reporting municipal concerns (road potholes, overflowing garbage vats, drainage blockages, or unlit streetlights) or tracking existing tickets.",
      report: "You can report local civic issues without creating an account! Choose 'Report an issue' from the menu. You'll be guided through selecting an issue category, recording a voice message or writing a description, attaching an optional photo, and confirming your location.",
      track: "To track your report, look up your ticket code (e.g. SJ-2026-8492) on the 'Track a complaint' page. You will see a chronological timeline with status updates from Received to Resolved.",
      photo: "No, a photograph is not strictly required! While photos help municipal engineers bring the right tools and asphalt mixes, a voice message or text description along with your ward or landmark is sufficient.",
      team: "'Sent to the responsible team' means our coordination officer has reviewed your report, checked that it is not a duplicate, verified jurisdiction, and dispatched a formal work order to the specialized department (such as the Road Infrastructure Wing or Conservancy Directorate).",
      duplicate: "When multiple residents report the same pothole or spillage in the same block, SANJAYA links them to a unified master work ticket. That way, the department isn't overwhelmed by redundant calls, and all reporting residents receive status updates together!"
    }
  };

  function appendMessage(text, sender = "assistant") {
    if (!messagesContainer) return;
    const msg = document.createElement("div");
    msg.className = `chat-msg msg-${sender}`;
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Speech synthesis if assistant and speech enabled (English)
    if (sender === "assistant" && window.speechSynthesis && !window.speechSynthesis.speaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  function answerQuery(queryText) {
    appendMessage(queryText, "user");

    setTimeout(() => {
      const q = queryText.toLowerCase();
      const langDict = knowledgeBase[activeLang] || knowledgeBase.en;
      let reply = langDict.default;

      if (q.includes("report") || q.includes("how to report") || q.includes("दर्ज") || q.includes("জানান")) {
        reply = langDict.report;
      } else if (q.includes("track") || q.includes("ticket") || q.includes("स्थिति") || q.includes("ট্র্যাক")) {
        reply = langDict.track;
      } else if (q.includes("photo") || q.includes("camera") || q.includes("image") || q.includes("फोटो") || q.includes("ছবি")) {
        reply = langDict.photo;
      } else if (q.includes("responsible team") || q.includes("sent") || q.includes("टीम") || q.includes("দল")) {
        reply = langDict.team;
      } else if (q.includes("duplicate") || q.includes("redundant") || q.includes("दोहराव")) {
        reply = langDict.duplicate;
      } else if (q.includes("language") || q.includes("hindi") || q.includes("bengali") || q.includes("भाषा") || q.includes("ভাষা")) {
        reply = langDict.language;
      }

      appendMessage(reply, "assistant");
    }, 350);
  }

  // Handle Form Input Submit
  function handleSend() {
    const val = input?.value.trim();
    if (!val) return;
    input.value = "";
    answerQuery(val);
  }

  sendBtn?.addEventListener("click", handleSend);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  // Handle Prompt Chips
  promptChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      answerQuery(chip.textContent.trim());
    });
  });

  // Voice Input via Web Speech API
  let isListening = false;
  let recognition = null;

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      if (input) input.value = speechToText;
      handleSend();
    };

    recognition.onend = () => {
      isListening = false;
      micBtn?.classList.remove("is-active");
    };

    recognition.onerror = () => {
      isListening = false;
      micBtn?.classList.remove("is-active");
    };
  }

  micBtn?.addEventListener("click", () => {
    if (!recognition) {
      showToast("Speech recognition is not supported in this browser.", "info");
      return;
    }

    if (!isListening) {
      try {
        if (activeLang === "hi") recognition.lang = "hi-IN";
        else if (activeLang === "bn") recognition.lang = "bn-IN";
        else recognition.lang = "en-IN";

        recognition.start();
        isListening = true;
        micBtn.classList.add("is-active");
        showToast("Listening... Speak your civic question.", "info");
      } catch (err) {
        console.warn("Speech error", err);
      }
    } else {
      recognition.stop();
      isListening = false;
      micBtn.classList.remove("is-active");
    }
  });

  // Listen to language switch events
  window.addEventListener("sanjaya-language-change", (e) => {
    activeLang = e.detail.lang;
    const greeting = SANJAYA_DATA.i18n[activeLang]?.assistantGreeting || SANJAYA_DATA.i18n.en.assistantGreeting;
    appendMessage(greeting, "assistant");
  });
}

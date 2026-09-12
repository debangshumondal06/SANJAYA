/* ==========================================================================
   SANJAYA i18n Module
   Registers exactly three assistant languages: English (en), Hindi (hi),
   Bengali (bn). Switches all on-page text, the speech-recognition input
   language, and the speech-synthesis (spoken reply) language/voice together
   whenever the user picks a language pill in the header.

   This file is additive — it does not alter any other script. If
   js/assistant.js already owns sending/receiving chat messages, it can read
   the current language at any time via:
     window.SanjayaI18n.getLang()          -> "en" | "hi" | "bn"
     window.SanjayaI18n.getSpeechLang()     -> "en-IN" | "hi-IN" | "bn-IN"
     window.SanjayaI18n.t(key)              -> translated string for key
     window.SanjayaI18n.speak(text, lang?)  -> speaks text using that lang's voice
   and can listen for changes via:
     window.addEventListener("sanjaya:langchange", (e) => { e.detail.lang ... })
   ========================================================================== */

(function () {
  "use strict";

  /* Only these three languages are ever registered for this assistant. */
  var SUPPORTED_LANGS = ["en", "hi", "bn"];
  var STORAGE_KEY = "sanjaya_assistant_lang";

  var BCP47 = {
    en: "en-IN",
    hi: "hi-IN",
    bn: "bn-IN"
  };

  var DISPLAY_NAME = {
    en: "English",
    hi: "हिन्दी",
    bn: "বাংলা"
  };

  var STRINGS = {
    en: {
      eyebrow: "Civic Voice Assistant",
      title: "Ask in the way <em>that works for you</em>",
      lead: "Type or speak naturally in English. Ask questions about reporting issues, tracking tickets, or municipal services.",
      chatTitle: "Ask SANJAYA Assistant",
      chatBadge: "Voice & Text Enabled",
      greeting: "Greetings. I am SANJAYA's civic assistant. How may I assist you today? You can tap any suggested prompt below or type your question.",
      chip1: "What can I report?",
      chip2: "How do I find my ticket?",
      chip3: "Can I report without a photo?",
      chip4: "What does 'Sent to responsible team' mean?",
      chip5: "How are duplicate reports handled?",
      placeholder: "Type your civic question in English...",
      send: "Ask",
      micLabel: "Record voice question",
      micTitle: "Speak question",
      voiceGuideTitle: "🎙️ Voice Guidance",
      voiceGuideText: "Tap the microphone button and speak clearly. The assistant will transcribe your speech and respond with audio synthesis.",
      privacyTitle: "🔒 Citizen Privacy",
      privacyText: "Queries are processed for civic guidance without storing personal credentials or private recordings.",
      micUnsupported: "Voice input isn't supported in this browser.",
      listening: "Listening in English..."
    },
    hi: {
      eyebrow: "नागरिक वॉइस सहायक",
      title: "जिस तरह <em>आपके लिए आसान हो</em>, उसी तरह पूछें",
      lead: "हिंदी में स्वाभाविक रूप से टाइप करें या बोलें। शिकायत दर्ज करने, टिकट ट्रैक करने या नगरपालिका सेवाओं के बारे में प्रश्न पूछें।",
      chatTitle: "पूछें सांजया सहायक",
      chatBadge: "आवाज़ और टेक्स्ट सक्षम",
      greeting: "नमस्कार। मैं सांजया का नागरिक सहायक हूं। आज मैं आपकी कैसे सहायता कर सकता हूं? आप नीचे दिए गए किसी सुझाए गए प्रश्न पर टैप कर सकते हैं या अपना प्रश्न टाइप कर सकते हैं।",
      chip1: "मैं क्या शिकायत दर्ज कर सकता हूं?",
      chip2: "मुझे अपना टिकट कैसे मिलेगा?",
      chip3: "क्या मैं बिना फ़ोटो के शिकायत दर्ज कर सकता हूं?",
      chip4: "'संबंधित टीम को भेजा गया' का क्या मतलब है?",
      chip5: "डुप्लिकेट शिकायतों को कैसे संभाला जाता है?",
      placeholder: "अपना नागरिक प्रश्न हिंदी में टाइप करें...",
      send: "पूछें",
      micLabel: "आवाज़ में प्रश्न रिकॉर्ड करें",
      micTitle: "प्रश्न बोलें",
      voiceGuideTitle: "🎙️ आवाज़ मार्गदर्शन",
      voiceGuideText: "माइक्रोफ़ोन बटन दबाएं और स्पष्ट रूप से बोलें। सहायक आपकी आवाज़ को लिखित रूप में बदलेगा और ऑडियो के साथ जवाब देगा।",
      privacyTitle: "🔒 नागरिक गोपनीयता",
      privacyText: "प्रश्नों को नागरिक मार्गदर्शन हेतु संसाधित किया जाता है, बिना किसी व्यक्तिगत क्रेडेंशियल या निजी रिकॉर्डिंग को संग्रहीत किए।",
      micUnsupported: "इस ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है।",
      listening: "हिंदी में सुन रहा हूं..."
    },
    bn: {
      eyebrow: "নাগরিক ভয়েস সহায়ক",
      title: "যেভাবে <em>আপনার জন্য সহজ</em>, সেভাবেই জিজ্ঞাসা করুন",
      lead: "বাংলায় স্বাভাবিকভাবে টাইপ করুন বা বলুন। অভিযোগ জানানো, টিকিট ট্র্যাক করা বা পৌর পরিষেবা সম্পর্কে প্রশ্ন জিজ্ঞাসা করুন।",
      chatTitle: "আস্ক সানজায়া সহায়ক",
      chatBadge: "ভয়েস ও টেক্সট সক্ষম",
      greeting: "নমস্কার। আমি সানজায়ার নাগরিক সহায়ক। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি? আপনি নিচের যেকোনো প্রস্তাবিত প্রশ্নে ট্যাপ করতে পারেন অথবা নিজের প্রশ্ন টাইপ করতে পারেন।",
      chip1: "আমি কী রিপোর্ট করতে পারি?",
      chip2: "আমি কীভাবে আমার টিকিট খুঁজে পাব?",
      chip3: "ছবি ছাড়া কি রিপোর্ট করা যায়?",
      chip4: "'দায়িত্বপ্রাপ্ত দলে পাঠানো হয়েছে' মানে কী?",
      chip5: "ডুপ্লিকেট রিপোর্ট কীভাবে সামলানো হয়?",
      placeholder: "আপনার নাগরিক প্রশ্ন বাংলায় টাইপ করুন...",
      send: "জিজ্ঞাসা করুন",
      micLabel: "ভয়েস প্রশ্ন রেকর্ড করুন",
      micTitle: "প্রশ্ন বলুন",
      voiceGuideTitle: "🎙️ ভয়েস নির্দেশিকা",
      voiceGuideText: "মাইক্রোফোন বোতাম চাপুন এবং স্পষ্টভাবে বলুন। সহায়ক আপনার কথা লিখে নেবে এবং অডিওতে উত্তর দেবে।",
      privacyTitle: "🔒 নাগরিক গোপনীয়তা",
      privacyText: "ব্যক্তিগত পরিচয়পত্র বা ব্যক্তিগত রেকর্ডিং সংরক্ষণ না করেই প্রশ্নগুলি নাগরিক নির্দেশনার জন্য প্রক্রিয়া করা হয়।",
      micUnsupported: "এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়।",
      listening: "বাংলায় শুনছি..."
    }
  };

  var currentLang = "en";

  function isSupported(lang) {
    return SUPPORTED_LANGS.indexOf(lang) !== -1;
  }

  function t(key) {
    var dict = STRINGS[currentLang] || STRINGS.en;
    return dict[key] !== undefined ? dict[key] : (STRINGS.en[key] || "");
  }

  function applyTextToDom() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(key);
      if (val) el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      var val = t(key);
      if (val) el.innerHTML = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      var val = t(key);
      if (val) el.setAttribute("placeholder", val);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      var val = t(key);
      if (val) el.setAttribute("aria-label", val);
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      var val = t(key);
      if (val) el.setAttribute("title", val);
    });
  }

  function updateSelectorButtons() {
    document.querySelectorAll(".lang-selector .lang-btn").forEach(function (btn) {
      var lang = btn.getAttribute("data-lang");
      var active = lang === currentLang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setLang(lang) {
    if (!isSupported(lang)) return;
    currentLang = lang;

    document.documentElement.lang = BCP47[lang];
    document.body.setAttribute("data-active-lang", lang);

    applyTextToDom();
    updateSelectorButtons();

    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }

    window.dispatchEvent(new CustomEvent("sanjaya:langchange", {
      detail: {
        lang: lang,
        speechLang: BCP47[lang],
        displayName: DISPLAY_NAME[lang]
      }
    }));
  }

  function getLang() {
    return currentLang;
  }

  function getSpeechLang() {
    return BCP47[currentLang];
  }

  /* ---- Speech recognition (mic input), locked to the selected language ---- */
  var recognition = null;
  var isListening = false;

  function getRecognitionCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function startListening() {
    var Ctor = getRecognitionCtor();
    var input = document.getElementById("chat-input");
    var micBtn = document.getElementById("chat-mic-btn");

    if (!Ctor) {
      if (input) input.placeholder = t("micUnsupported");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    recognition = new Ctor();
    recognition.lang = getSpeechLang();       // en-IN / hi-IN / bn-IN only
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    isListening = true;
    if (micBtn) micBtn.classList.add("is-active");
    if (input) input.placeholder = t("listening");

    recognition.onresult = function (event) {
      var transcript = "";
      for (var i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (input) input.value = transcript;
    };

    recognition.onerror = function () {
      stopListening();
    };

    recognition.onend = function () {
      stopListening();
    };

    recognition.start();
  }

  function stopListening() {
    isListening = false;
    var micBtn = document.getElementById("chat-mic-btn");
    var input = document.getElementById("chat-input");
    if (micBtn) micBtn.classList.remove("is-active");
    if (input) input.setAttribute("placeholder", t("placeholder"));
    if (recognition) {
      try { recognition.stop(); } catch (e) { /* already stopped */ }
    }
  }

  /* ---- Speech synthesis (spoken reply), matched to the selected language ---- */
  function pickVoiceFor(lang) {
    if (!("speechSynthesis" in window)) return null;
    var target = BCP47[lang];
    var short = lang;
    var voices = window.speechSynthesis.getVoices() || [];

    var exact = voices.filter(function (v) { return v.lang === target; });
    if (exact.length) return exact[0];

    var prefix = voices.filter(function (v) {
      return v.lang && v.lang.toLowerCase().indexOf(short) === 0;
    });
    if (prefix.length) return prefix[0];

    return null;
  }

  function speak(text, lang) {
    if (!("speechSynthesis" in window) || !text) return;
    var useLang = isSupported(lang) ? lang : currentLang;

    window.speechSynthesis.cancel();

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BCP47[useLang];

    var voice = pickVoiceFor(useLang);
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }

  /* Some browsers load voice lists asynchronously. */
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = function () { /* voices ready */ };
  }

  /* ---- Auto-speak assistant replies in the currently selected language ----
     Watches the chat log for new assistant bubbles (however they get added —
     by assistant.js, adapter.js, or a prompt-chip click) and speaks each one
     aloud using the language selected right now. This is what makes the
     voice reply follow the EN/HI/BN picker without touching assistant.js. */
  function watchForSpokenReplies() {
    var log = document.getElementById("chat-messages");
    if (!log || !("MutationObserver" in window)) return;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return; // element nodes only

          var bubble = node.classList && node.classList.contains("msg-assistant")
            ? node
            : node.querySelector && node.querySelector(".msg-assistant");

          if (bubble) {
            var text = bubble.textContent.trim();
            if (text) speak(text);
          }
        });
      });
    });

    observer.observe(log, { childList: true, subtree: true });
  }

  /* ---- Wiring ---- */
  function init() {
    var saved = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    var initialLang = isSupported(saved) ? saved : "en";

    document.querySelectorAll(".lang-selector .lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        setLang(lang);
      });
    });

    var micBtn = document.getElementById("chat-mic-btn");
    if (micBtn) {
      micBtn.addEventListener("click", startListening);
    }

    watchForSpokenReplies();
    setLang(initialLang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Public API for other scripts (e.g. assistant.js) to hook into. */
  window.SanjayaI18n = {
    SUPPORTED_LANGS: SUPPORTED_LANGS.slice(),
    getLang: getLang,
    getSpeechLang: getSpeechLang,
    setLang: setLang,
    t: t,
    speak: speak,
    startListening: startListening,
    stopListening: stopListening
  };
})();
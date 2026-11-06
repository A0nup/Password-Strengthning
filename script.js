/**
 * Password Strengthening System
 * Core Client Logic & Cryptographic Engine
 * Author: A0nup
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements - Evaluation
  const passwordInput = document.getElementById("password-input");
  const btnToggleEye = document.getElementById("btn-toggle-eye");
  const eyeIcon = document.getElementById("eye-icon");
  const btnEvaluate = document.getElementById("btn-evaluate");
  const evalResultBox = document.getElementById("eval-result-box");
  const scoreNum = document.getElementById("score-num");
  const levelName = document.getElementById("level-name");
  const segmentedMeter = document.getElementById("segmented-meter");
  const suggestionsWrap = document.getElementById("suggestions-wrap");
  const suggestionsList = document.getElementById("suggestions-list");
  
  // Validation Items
  const valLen = document.getElementById("val-len");
  const valUpper = document.getElementById("val-upper");
  const valLower = document.getElementById("val-lower");
  const valNum = document.getElementById("val-num");
  const valSpecial = document.getElementById("val-special");

  // Sidebar Requirements
  const reqLen = document.getElementById("req-len");
  const reqUpper = document.getElementById("req-upper");
  const reqLower = document.getElementById("req-lower");
  const reqNum = document.getElementById("req-num");
  const reqSpecial = document.getElementById("req-special");

  // Generator Elements
  const quickGenBtn = document.getElementById("btn-quick-generate");
  const quickPassDisplay = document.getElementById("quick-password-display");
  const quickCopyBtn = document.getElementById("btn-quick-copy");

  const customGenBtn = document.getElementById("btn-generate-custom");
  const customPassDisplay = document.getElementById("custom-gen-display");
  const customCopyBtn = document.getElementById("btn-copy-custom");
  const lengthSlider = document.getElementById("gen-length");
  const lengthDisplay = document.getElementById("length-display");
  const customEntropyInfo = document.getElementById("custom-entropy-info");

  const optUpper = document.getElementById("opt-upper");
  const optLower = document.getElementById("opt-lower");
  const optNumbers = document.getElementById("opt-numbers");
  const optSymbols = document.getElementById("opt-symbols");

  // Tabs
  const tabCheck = document.getElementById("tab-check");
  const tabGen = document.getElementById("tab-gen");
  const viewCheck = document.getElementById("view-check");
  const viewGen = document.getElementById("view-gen");

  // Modals & Nav
  const navAbout = document.getElementById("nav-about");
  const navHow = document.getElementById("nav-how");
  const modalAbout = document.getElementById("modal-about");
  const modalHow = document.getElementById("modal-how");
  const toast = document.getElementById("toast-msg");

  // Character sets for generation
  const CHAR_SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/~"
  };

  /**
   * Cryptographically secure random integer generator
   */
  function getRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  /**
   * Generate cryptographically secure password
   */
  function generateSecurePassword(length = 16, includeUpper = true, includeLower = true, includeNumbers = true, includeSymbols = true) {
    let pool = "";
    const mandatoryChars = [];

    if (includeUpper) {
      pool += CHAR_SETS.upper;
      mandatoryChars.push(CHAR_SETS.upper[getRandomInt(CHAR_SETS.upper.length)]);
    }
    if (includeLower) {
      pool += CHAR_SETS.lower;
      mandatoryChars.push(CHAR_SETS.lower[getRandomInt(CHAR_SETS.lower.length)]);
    }
    if (includeNumbers) {
      pool += CHAR_SETS.numbers;
      mandatoryChars.push(CHAR_SETS.numbers[getRandomInt(CHAR_SETS.numbers.length)]);
    }
    if (includeSymbols) {
      pool += CHAR_SETS.symbols;
      mandatoryChars.push(CHAR_SETS.symbols[getRandomInt(CHAR_SETS.symbols.length)]);
    }

    if (pool === "") {
      pool = CHAR_SETS.lower + CHAR_SETS.numbers;
      mandatoryChars.push(CHAR_SETS.lower[getRandomInt(CHAR_SETS.lower.length)]);
    }

    const passwordArr = [...mandatoryChars];
    const remainingLength = Math.max(0, length - passwordArr.length);

    for (let i = 0; i < remainingLength; i++) {
      passwordArr.push(pool[getRandomInt(pool.length)]);
    }

    // Cryptographic Fisher-Yates Shuffle
    for (let i = passwordArr.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
    }

    return passwordArr.join("");
  }

  /**
   * Calculate password entropy and crack time
   */
  function calculateEntropyAndCrackTime(password) {
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/\d/.test(password)) poolSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;
    if (poolSize === 0) poolSize = 1;

    const entropy = Math.round(password.length * Math.log2(poolSize));
    const combinations = Math.pow(poolSize, password.length);
    const guessesPerSec = 1e10; // 10 Billion guesses per second (High-end GPU array)
    const secondsToCrack = combinations / (2 * guessesPerSec);

    let crackTimeText = "Instantly";
    if (secondsToCrack > 31536000 * 1000000) {
      crackTimeText = "~" + (secondsToCrack / (31536000 * 100)).toExponential(1) + " Centuries";
    } else if (secondsToCrack > 31536000 * 100) {
      crackTimeText = Math.round(secondsToCrack / (31536000 * 100)) + " Centuries";
    } else if (secondsToCrack > 31536000) {
      crackTimeText = Math.round(secondsToCrack / 31536000) + " Years";
    } else if (secondsToCrack > 86400) {
      crackTimeText = Math.round(secondsToCrack / 86400) + " Days";
    } else if (secondsToCrack > 3600) {
      crackTimeText = Math.round(secondsToCrack / 3600) + " Hours";
    } else if (secondsToCrack > 60) {
      crackTimeText = Math.round(secondsToCrack / 60) + " Minutes";
    } else if (secondsToCrack > 1) {
      crackTimeText = Math.round(secondsToCrack) + " Seconds";
    }

    return { entropy, crackTimeText };
  }

  /**
   * Evaluate password strength
   */
  function evaluatePassword(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    let score = 0;
    const feedback = [];

    if (checks.length) score++;
    else feedback.push("Use at least 8 characters.");

    if (checks.uppercase) score++;
    else feedback.push("Add an uppercase letter (A – Z).");

    if (checks.lowercase) score++;
    else feedback.push("Add a lowercase letter (a – z).");

    if (checks.number) score++;
    else feedback.push("Add a number (0 – 9).");

    if (checks.special) score++;
    else feedback.push("Add a special character (e.g. !@#$%^&*).");

    const levels = {
      0: { name: "Very Weak", class: "status-very-weak", colorClass: "fill-red" },
      1: { name: "Weak", class: "status-weak", colorClass: "fill-orange" },
      2: { name: "Moderate", class: "status-moderate", colorClass: "fill-yellow" },
      3: { name: "Good", class: "status-good", colorClass: "fill-blue" },
      4: { name: "Strong", class: "status-strong", colorClass: "fill-green" },
      5: { name: "Very Strong", class: "status-very-strong", colorClass: "fill-green" }
    };

    return {
      score,
      level: levels[score].name,
      statusClass: levels[score].class,
      colorClass: levels[score].colorClass,
      feedback,
      checks
    };
  }

  /**
   * Render evaluation result to UI
   */
  function renderEvaluation(result) {
    scoreNum.textContent = `${result.score} / 5`;
    levelName.textContent = result.level;

    // Reset status classes
    evalResultBox.className = `result-box ${result.statusClass}`;

    // Render 5-segment meter
    const bars = segmentedMeter.querySelectorAll(".meter-bar");
    bars.forEach((bar, idx) => {
      bar.className = "meter-bar";
      if (idx < result.score) {
        bar.classList.add("active", result.colorClass);
      }
    });

    // Render suggestions
    suggestionsList.innerHTML = "";
    if (result.feedback.length > 0) {
      suggestionsWrap.style.display = "flex";
      result.feedback.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        suggestionsList.appendChild(li);
      });
    } else {
      suggestionsWrap.style.display = "flex";
      const li = document.createElement("li");
      li.textContent = "All security requirements passed! Password is strong.";
      suggestionsList.appendChild(li);
    }

    // Update validation details list
    updateValItem(valLen, result.checks.length, "Minimum length (≥ 8 characters)");
    updateValItem(valUpper, result.checks.uppercase, "Uppercase letter (A – Z)");
    updateValItem(valLower, result.checks.lowercase, "Lowercase letter (a – z)");
    updateValItem(valNum, result.checks.number, "Number (0 – 9)");
    updateValItem(valSpecial, result.checks.special, "Special character (e.g. !@#$%^&*)");

    // Update right-hand requirements checklist
    updateReqItem(reqLen, result.checks.length);
    updateReqItem(reqUpper, result.checks.uppercase);
    updateReqItem(reqLower, result.checks.lowercase);
    updateReqItem(reqNum, result.checks.number);
    updateReqItem(reqSpecial, result.checks.special);
  }

  function updateValItem(el, passed, label) {
    if (!el) return;
    if (passed) {
      el.className = "valid-item pass";
      el.innerHTML = `<span class="val-icon">✔</span><span>${label}</span>`;
    } else {
      el.className = "valid-item fail";
      el.innerHTML = `<span class="val-icon">✖</span><span>${label} — <span class="not-found-text">Not Found</span></span>`;
    }
  }

  function updateReqItem(el, passed) {
    if (!el) return;
    if (passed) {
      el.classList.add("pass");
    } else {
      el.classList.remove("pass");
    }
  }

  /**
   * Show toast alert
   */
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  /**
   * Copy to clipboard helper
   */
  async function copyText(text, btnElement) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Password copied to clipboard!");
      if (btnElement) {
        btnElement.classList.add("copied");
        setTimeout(() => {
          btnElement.classList.remove("copied");
        }, 1500);
      }
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("Password copied to clipboard!");
    }
  }

  // Event Listeners - Password Input & Realtime Evaluation
  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    const res = evaluatePassword(val);
    renderEvaluation(res);
  });

  btnEvaluate.addEventListener("click", () => {
    const val = passwordInput.value;
    const res = evaluatePassword(val);
    renderEvaluation(res);
  });

  // Toggle Password Visibility (Eye Icon)
  btnToggleEye.addEventListener("click", () => {
    const isPassword = passwordInput.getAttribute("type") === "password";
    if (isPassword) {
      passwordInput.setAttribute("type", "text");
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      `;
    } else {
      passwordInput.setAttribute("type", "password");
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      `;
    }
  });

  // Quick Generator (Right Sidebar)
  quickGenBtn.addEventListener("click", () => {
    const newPass = generateSecurePassword(16, true, true, true, true);
    quickPassDisplay.textContent = newPass;
  });

  quickCopyBtn.addEventListener("click", () => {
    copyText(quickPassDisplay.textContent, quickCopyBtn);
  });

  // Advanced Custom Generator (Left Tab)
  function updateCustomGenerator() {
    const len = parseInt(lengthSlider.value, 10);
    lengthDisplay.textContent = `${len} characters`;

    const pass = generateSecurePassword(
      len,
      optUpper.checked,
      optLower.checked,
      optNumbers.checked,
      optSymbols.checked
    );
    customPassDisplay.textContent = pass;

    const { entropy, crackTimeText } = calculateEntropyAndCrackTime(pass);
    customEntropyInfo.innerHTML = `
      <span>Entropy: <strong>${entropy} bits</strong></span> &bull; 
      <span>Crack Time: <strong>~${crackTimeText}</strong></span>
    `;
  }

  lengthSlider.addEventListener("input", updateCustomGenerator);
  optUpper.addEventListener("change", updateCustomGenerator);
  optLower.addEventListener("change", updateCustomGenerator);
  optNumbers.addEventListener("change", updateCustomGenerator);
  optSymbols.addEventListener("change", updateCustomGenerator);
  customGenBtn.addEventListener("click", updateCustomGenerator);

  customCopyBtn.addEventListener("click", () => {
    copyText(customPassDisplay.textContent, customCopyBtn);
  });

  // Tabs Switching
  tabCheck.addEventListener("click", () => {
    tabCheck.classList.add("active");
    tabGen.classList.remove("active");
    viewCheck.classList.add("active");
    viewGen.classList.remove("active");
  });

  tabGen.addEventListener("click", () => {
    tabGen.classList.add("active");
    tabCheck.classList.remove("active");
    viewGen.classList.add("active");
    viewCheck.classList.remove("active");
    updateCustomGenerator();
  });

  // Modals
  navAbout.addEventListener("click", () => modalAbout.classList.add("open"));
  navHow.addEventListener("click", () => modalHow.classList.add("open"));

  document.querySelectorAll("[data-close]").forEach(el => {
    el.addEventListener("click", () => {
      const targetId = el.getAttribute("data-close");
      const targetModal = document.getElementById(targetId);
      if (targetModal) targetModal.classList.remove("open");
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      e.target.classList.remove("open");
    }
  });

  // Initial Run on load
  const initialPass = passwordInput.value || "Anup-@1";
  renderEvaluation(evaluatePassword(initialPass));
  updateCustomGenerator();
});

document.addEventListener("DOMContentLoaded", () => {

  // --- NEW: System Theme Synchronization ---
  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
  };

  const checkSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
  };

  // Check theme on initial load
  checkSystemTheme();

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkSystemTheme);
  // --- END NEW THEME LOGIC ---


  // --- Global State ---
  let state = {
    username: sessionStorage.getItem("pm_username"),
    master_password: sessionStorage.getItem("pm_master_password"),
  };

  // --- Selectors ---
  const loginBox = document.getElementById("loginContainer");
  const registerBox = document.getElementById("registerContainer");
  const managerBox = document.getElementById("manager");
  const otpLoginBox = document.getElementById("otpLoginContainer");

  // Login
  const loginBtn = document.getElementById("loginBtn");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  const loginMasterPassword = document.getElementById("loginMasterPassword");
  const loginMessage = document.getElementById("loginMessage");

  // Register
  const registerBtn = document.getElementById("registerBtn");
  const registerUsername = document.getElementById("registerUsername");
  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const registerMasterPassword = document.getElementById("registerMasterPassword");
  const registerMessage = document.getElementById("registerMessage");
  const registerMsgText = document.getElementById("registerMsgText");
  const tickIcon = document.getElementById("tickIcon");

  // Register - Password Tools
  const suggestBtn = document.getElementById("suggestPwdBtn");
  const suggestedPwd = document.getElementById("suggestedPassword");
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");

  // --- OTP Selectors ---
  const otpUsername = document.getElementById("otpUsername");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpFields = document.getElementById("otpFields");
  const otpCode = document.getElementById("otpCode");
  const otpMasterPassword = document.getElementById("otpMasterPassword");
  const otpLoginBtn = document.getElementById("otpLoginBtn");
  const otpMessage = document.getElementById("otpMessage");

  // --- Links ---
  const showRegister = document.getElementById("registerPrompt");
  const showLogin = document.getElementById("goToLogin");
  const goToOtpLogin = document.getElementById("goToOtpLogin");
  const goToPasswordLogin = document.getElementById("goToPasswordLogin");


  // Manager
  const welcomeMsg = document.getElementById("welcomeMsg");
  const addBtn = document.getElementById("addPwdBtn");
  const siteInput = document.getElementById("site");
  const usernameInput = document.getElementById("uname");
  const passInput = document.getElementById("pass");
  const suggestPinBtn = document.getElementById("suggestPinBtn");
  const passwordList = document.getElementById("passwordList");
  const logoutBtn = document.getElementById("logoutBtn");

  const API_URL = "http://127.0.0.1:8080";

  // --- UI Functions ---

  function showMessage(element, text, isError = true) {
    let textElement = element;

    // Handle the complex register message element
    if (element.id === 'registerMessage') {
        textElement = document.getElementById('registerMsgText');
        tickIcon.style.display = isError ? "none" : "inline";
    }

    textElement.textContent = text;
    element.className = isError ? "message error" : "message success";
  }

  function clearMessage(element) {
    let textElement = element;
    if (element.id === 'registerMessage') {
        textElement = document.getElementById('registerMsgText');
        tickIcon.style.display = 'none';
    }
    textElement.textContent = "";
    element.className = "message";
  }

  function updateUI() {
    state.username = sessionStorage.getItem("pm_username");
    state.master_password = sessionStorage.getItem("pm_master_password");

    if (state.username && state.master_password) {
      // Logged in
      loginBox.style.display = "none";
      registerBox.style.display = "none";
      otpLoginBox.style.display = "none";
      managerBox.style.display = "block";
      welcomeMsg.textContent = `Welcome, ${state.username}!`;
      loadAccounts();
    } else {
      // Logged out
      loginBox.style.display = "block";
      registerBox.style.display = "none";
      otpLoginBox.style.display = "none";
      managerBox.style.display = "none";
    }
  }

  // --- API Functions ---

  async function handleLogin() {
    const username = loginUsername.value;
    const password = loginPassword.value;
    const master_password = loginMasterPassword.value;

    if (!username || !password || !master_password) {
      showMessage(loginMessage, "All fields are required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, master_password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("pm_username", username);
        sessionStorage.setItem("pm_master_password", master_password);
        clearMessage(loginMessage);
        loginUsername.value = '';
        loginPassword.value = '';
        loginMasterPassword.value = '';
        updateUI();
      } else {
        showMessage(loginMessage, data.message);
      }
    } catch (err) {
      showMessage(loginMessage, "Server error. Please try again.");
    }
  }

  async function handleRegister() {
    const username = registerUsername.value;
    const email = registerEmail.value;
    const password = registerPassword.value;
    const master_password = registerMasterPassword.value;

    if (!username || !password || !master_password || !email) {
      showMessage(registerMessage, "All fields are required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, master_password }),
      });
      const data = await res.json();

      if (data.success) {
        showMessage(registerMessage, data.message + " Redirecting to login...", false);

        registerUsername.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        registerMasterPassword.value = '';
        suggestedPwd.value = '';
        checkStrength('');

        setTimeout(() => {
            loginBox.style.display = "block";
            registerBox.style.display = "none";
            clearMessage(registerMessage);
        }, 2500);

      } else {
        showMessage(registerMessage, data.message);
      }
    } catch (err) {
      showMessage(registerMessage, "Server error. Please try again.");
    }
  }

  // --- OTP LOGIN FUNCTIONS ---
  async function handleSendOtp() {
    const username = otpUsername.value;
    if (!username) {
        showMessage(otpMessage, "Please enter your username");
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";

    try {
        const res = await fetch(`${API_URL}/api/login/otp/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        const data = await res.json();

        if (data.success) {
            showMessage(otpMessage, data.message, false); // Show success message
            otpUsername.disabled = true; // Lock the username field
            otpFields.style.display = "block"; // Show OTP and Master Pass fields
        } else {
            showMessage(otpMessage, data.message);
        }
    } catch (err) {
        showMessage(otpMessage, "Server error. Please try again.");
    }

    sendOtpBtn.disabled = false;
    sendOtpBtn.textContent = "Send OTP";
  }

  async function handleOtpLogin() {
    const username = otpUsername.value;
    const otp = otpCode.value;
    const master_password = otpMasterPassword.value;

    if (!otp || !master_password) {
        showMessage(otpMessage, "Please enter your OTP and Master Password");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/login/otp/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, otp, master_password }),
        });
        const data = await res.json();

        if (data.success) {
            // Success! Log the user in
            sessionStorage.setItem("pm_username", username);
            sessionStorage.setItem("pm_master_password", master_password);

            // Clear fields
            otpUsername.value = '';
            otpCode.value = '';
            otpMasterPassword.value = '';
            otpUsername.disabled = false;
            otpFields.style.display = "none";
            clearMessage(otpMessage);

            updateUI();
        } else {
            showMessage(otpMessage, data.message);
        }
    } catch (err) {
        showMessage(otpMessage, "Server error. Please try again.");
    }
  }


  // --- Other Functions (Unchanged) ---

  async function handleSuggestPassword() {
      try {
          const res = await fetch(`${API_URL}/api/suggest-password?length=16`);
          const data = await res.json();
          if (data.success) {
              suggestedPwd.value = data.password;
              registerPassword.value = data.password;
              checkStrength(data.password);
          }
      } catch (err) {
          console.error("Failed to suggest password", err);
      }
  }

  async function handleSuggestPin() {
      try {
        const res = await fetch(`${API_URL}/api/suggest-pin`);
        const data = await res.json();
        if (data.success) {
          passInput.value = data.pin;
        }
      } catch (err) {
        console.error("Failed to suggest PIN", err);
      }
  }

  async function checkStrength(password) {
      if (!strengthBar || !strengthText) return;
      if (password.length === 0) {
          strengthBar.style.width = '0%';
          strengthText.textContent = '';
          return;
      }
      const res = await fetch(`${API_URL}/api/check-strength`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
      });
      const data = await res.json();
      strengthBar.style.width = data.score + '%';
      strengthText.textContent = data.verdict;
      if (data.score < 20) strengthBar.style.background = '#d64040';
      else if (data.score < 40) strengthBar.style.background = '#f0a000';
      else if (data.score < 60) strengthBar.style.background = '#f0e000';
      else if (data.score < 80) strengthBar.style.background = '#70e000';
      else strengthBar.style.background = '#007aff';
  }

  async function loadAccounts() {
    if (!state.username || !state.master_password) return;
    try {
      const res = await fetch(`${API_URL}/api/accounts/all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (!data.success) {
        handleLogout();
        return;
      }
      passwordList.innerHTML = "";
      if (data.accounts.length === 0) {
          passwordList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No accounts saved yet.</p>';
          return;
      }
      data.accounts.forEach(acc => {
        const item = document.createElement("div");
        item.className = "password-item";
        item.innerHTML = `
          <span>${acc.site}</span>
          <span>${acc.username}</span>
          <span class="password-value" title="Click to reveal">************</span>
          <button class="delete-btn" data-site="${acc.site}">Delete</button>
        `;
        const passSpan = item.querySelector('.password-value');
        let revealed = false;
        passSpan.addEventListener('click', () => {
            if (revealed) {
                passSpan.textContent = '************';
                passSpan.title = 'Click to reveal';
            } else {
                passSpan.textContent = acc.password;
                passSpan.title = 'Click to hide';
            }
            revealed = !revealed;
        });
        item.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete ${acc.site}?`)) {
                handleDelete(acc.site);
            }
        });
        passwordList.appendChild(item);
      });
    } catch (err) {
      console.error("Failed to load accounts", err);
    }
  }

  async function handleAddAccount() {
    const site = siteInput.value;
    const site_username = usernameInput.value;
    const site_password = passInput.value;
    if (!site || !site_username || !site_password) {
        alert("Please fill in all account fields.");
        return;
    }
    try {
        const res = await fetch(`${API_URL}/api/accounts`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
               ...state, site, site_username, site_password
           }),
        });
        const data = await res.json();
        if (data.success) {
            siteInput.value = '';
            usernameInput.value = '';
            passInput.value = '';
            loadAccounts();
        } else {
            alert(`Error: ${data.message}`);
            if (res.status === 401) handleLogout();
        }
    } catch (err) {
        alert("Server error. Could not add account.");
    }
  }

  async function handleDelete(site) {
    try {
        const res = await fetch(`${API_URL}/api/accounts`, {
           method: "DELETE",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ ...state, site }),
        });
        const data = await res.json();
        if (data.success) {
            loadAccounts();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        alert("Server error. Could not delete account.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("pm_username");
    sessionStorage.removeItem("pm_master_password");
    state = { username: null, master_password: null };
    updateUI();
  }

  // --- Event Listeners ---
  showRegister.addEventListener("click", () => {
    loginBox.style.display = "none";
    registerBox.style.display = "block";
    clearMessage(loginMessage);
  });

  showLogin.addEventListener("click", () => {
    loginBox.style.display = "block";
    registerBox.style.display = "none";
    clearMessage(registerMessage);
  });

  // --- NEW OTP Listeners ---
  goToOtpLogin.addEventListener("click", () => {
    loginBox.style.display = "none";
    otpLoginBox.style.display = "block";
    clearMessage(loginMessage);
  });

  goToPasswordLogin.addEventListener("click", () => {
    otpLoginBox.style.display = "none";
    loginBox.style.display = "block";
    clearMessage(otpMessage);
  });

  sendOtpBtn.addEventListener("click", handleSendOtp);
  otpLoginBtn.addEventListener("click", handleOtpLogin);


  // Main Actions
  loginBtn.addEventListener("click", handleLogin);
  registerBtn.addEventListener("click", handleRegister);
  addBtn.addEventListener("click", handleAddAccount);
  logoutBtn.addEventListener("click", handleLogout);

  // Utility Actions
  suggestBtn.addEventListener("click", handleSuggestPassword);
  suggestPinBtn.addEventListener("click", handleSuggestPin);

  // Add strength check on password input
  registerPassword.addEventListener('input', (e) => checkStrength(e.target.value));

  // --- Initial Page Load ---
  updateUI();
});
// --- DOM Element References ---
const passwordInput = document.getElementById('password');
const strengthText = document.getElementById('strength-text');
const strengthMeter = document.getElementById('strength-meter'); // The container for the bar
const strengthPercentage = document.getElementById('strength-percentage');
const criteriaFeedback = document.getElementById('criteria-feedback');
const generateButton = document.getElementById('generate-button');
const toggleInfoButton = document.querySelector('.info-toggle');
const noteBox = document.getElementById('noteBox');

// --- Constants ---
const MIN_PASSWORD_LENGTH = 12;
const SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const DIGIT_REGEX = /[0-9]/;

// --- Event Listeners ---

// Update strength meter on password input
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    updateStrengthDisplay(password);
});

// Generate a strong password on button click
generateButton.addEventListener('click', () => {
    const newPassword = generateStrongPassword();
    passwordInput.value = newPassword;
    // Manually trigger the input event to update the strength display
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
});

// Toggle the visibility of the information box
if (toggleInfoButton && noteBox) {
    toggleInfoButton.addEventListener('click', () => {
        noteBox.classList.toggle('hidden');
    });
} else {
    console.warn("Info toggle button or note box element not found.");
}


// --- Core Functions ---

/**
 * Evaluates the strength of a given password based on multiple criteria.
 * @param {string} password - The password string to evaluate.
 * @returns {object} An object containing the strength details:
 *                   { text, percent, color, criteriaMet: { length, upper, lower, digit, special, twoSpecials } }
 */
function getPasswordStrength(password) {
    let score = 0;
    const criteriaMet = {
        length: password.length >= MIN_PASSWORD_LENGTH,
        upper: UPPERCASE_REGEX.test(password),
        lower: LOWERCASE_REGEX.test(password),
        digit: DIGIT_REGEX.test(password),
        special: SPECIAL_CHARS_REGEX.test(password),
        twoSpecials: (password.match(new RegExp(SPECIAL_CHARS_REGEX.source, 'g')) || []).length >= 2
    };

    if (criteriaMet.length) score++;
    if (criteriaMet.upper) score++;
    if (criteriaMet.lower) score++;
    if (criteriaMet.digit) score++;
    if (criteriaMet.special) score++;
    // Bonus point effectively for having at least two special characters when all others met
    const isUltraStrong = score === 5 && criteriaMet.twoSpecials;

    let result = { text: "Çok Zayıf", percent: 0, color: "red", criteriaMet: criteriaMet }; // Default

    if (isUltraStrong) {
        result = { text: "Ultra Güçlü", percent: 100, color: "#007f00", criteriaMet: criteriaMet }; // Darker green
    } else {
        switch (score) {
            case 0:
            case 1:
                result = { text: "Çok Zayıf", percent: 20, color: "#dc3545", criteriaMet: criteriaMet }; // Bootstrap red
                break;
            case 2:
                result = { text: "Zayıf", percent: 40, color: "#fd7e14", criteriaMet: criteriaMet }; // Bootstrap orange
                break;
            case 3:
                result = { text: "Orta", percent: 60, color: "#ffc107", criteriaMet: criteriaMet }; // Bootstrap yellow/gold
                break;
            case 4:
                result = { text: "Güçlü", percent: 80, color: "lightgreen", criteriaMet: criteriaMet }; // Changed color for better distinction
                break;
            case 5: // All criteria met, but only one special character
                result = { text: "Çok Güçlü", percent: 90, color: "#28a745", criteriaMet: criteriaMet }; // Bootstrap green
                break;
        }
    }
    return result;
}

/**
 * Updates the UI elements (text, meter, percentage, feedback) based on password strength.
 * @param {string} password - The current password value.
 */
function updateStrengthDisplay(password) {
    if (password.trim() === "") {
        // Clear everything if the input is empty
        strengthText.textContent = "";
        strengthMeter.innerHTML = ""; // Clear the inner bar
        strengthMeter.style.backgroundColor = '#e9ecef'; // Reset background
        strengthPercentage.textContent = "";
        criteriaFeedback.textContent = "Güçlü bir şifre oluşturmak için yazmaya başlayın.";
        return;
    }

    const strength = getPasswordStrength(password);

    // Update Strength Text
    strengthText.textContent = strength.text;
    strengthText.style.color = strength.color;

    // Update Strength Meter Bar
    // Ensure the meter container has a default background
    strengthMeter.style.backgroundColor = '#e9ecef'; // e.g., light grey background
    // Set the inner bar's width and color
    strengthMeter.innerHTML = `<div style="height: 100%; width: ${strength.percent}%; background-color: ${strength.color}; border-radius: inherit; transition: width 0.3s ease-in-out;"></div>`;

    // Update Strength Percentage Text
    strengthPercentage.textContent = `Güçlülük: ${strength.percent}%`;

    // Update Criteria Feedback Text
    criteriaFeedback.textContent = getCriteriaFeedbackMessage(strength);
}


/**
 * Generates a user-friendly feedback message based on the password strength result.
 * @param {object} strength - The strength object returned by getPasswordStrength.
 * @returns {string} A feedback message.
 */
function getCriteriaFeedbackMessage(strength) {
    const criteria = strength.criteriaMet;
    const messages = [];

    if (strength.percent === 100) {
        return "Şifreniz ultra güçlü! Tüm kriterleri sağlıyor.";
    }
    if (strength.percent === 90) {
        return "Şifreniz çok güçlü! Ultra güçlülük için en az 2 özel karakter ekleyin.";
    }

    messages.push("Daha güçlü bir şifre için:");

    if (!criteria.length) {
        messages.push(`- En az ${MIN_PASSWORD_LENGTH} karakter uzunluğunda olmalı.`);
    }
    if (!criteria.lower) {
        messages.push("- En az bir küçük harf (a-z) içermeli.");
    }
    if (!criteria.upper) {
        messages.push("- En az bir büyük harf (A-Z) içermeli.");
    }
    if (!criteria.digit) {
        messages.push("- En az bir rakam (0-9) içermeli.");
    }
    if (!criteria.special) {
        messages.push("- En az bir özel karakter (!@#$...) içermeli.");
    }
     // This condition is implicitly handled by the %90 check above,
     // but could be added for extra clarity if score is 5 but twoSpecials is false
    // if (strength.score === 5 && !criteria.twoSpecials) {
    //    messages.push("- Ultra güçlülük için en az 2 özel karakter ekleyin.");
    // }


    // Avoid showing the initial prompt if criteria messages exist
    if (messages.length > 1) { // More than just the initial "Daha güçlü..." message
        return messages.join("\n"); // Use newline for better readability if needed, or " "
    } else {
        // This case should ideally not be reached if percent < 90,
        // but as a fallback:
        return "Şifreniz iyi durumda, ancak daha da güçlendirebilirsiniz.";
    }
}


/**
 * Generates a strong random password meeting all defined criteria, including at least two special characters.
 * @returns {string} A randomly generated strong password.
 */
function generateStrongPassword() {
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digitChars = "0123456789";
    const specialChars = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?";
    const allChars = lowerChars + upperChars + digitChars + specialChars;

    let passwordArray = [];

    // 1. Ensure required characters are included
    passwordArray.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
    passwordArray.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
    passwordArray.push(digitChars[Math.floor(Math.random() * digitChars.length)]);
    passwordArray.push(specialChars[Math.floor(Math.random() * specialChars.length)]);
    passwordArray.push(specialChars[Math.floor(Math.random() * specialChars.length)]); // Ensure two specials

    // 2. Fill the rest of the password length
    const remainingLength = MIN_PASSWORD_LENGTH - passwordArray.length;
    for (let i = 0; i < remainingLength; i++) {
        passwordArray.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    // 3. Shuffle the array to mix required characters randomly
    // Fisher-Yates (Knuth) Shuffle Algorithm
    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]]; // Swap
    }

    return passwordArray.join('');
}

// --- Initial State ---
// Set initial feedback message when the page loads
criteriaFeedback.textContent = "Güçlü bir şifre oluşturmak için yazmaya başlayın.";
strengthMeter.style.backgroundColor = '#e9ecef'; // Initial background for the meter container
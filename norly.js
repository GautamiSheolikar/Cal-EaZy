document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const prevDisplay = document.querySelector(".Previous-step");
    const currDisplay = document.querySelector(".Current-step");
    const historyBtn = document.getElementById("history-btn");
    const flagBtn = document.getElementById("flag-btn");
    const historyPanel = document.querySelector(".historycal");
    const flaggedPanel = document.querySelector(".flaggedcal");
    const historyContent = document.querySelector(".history-contnent");
    const flaggedContent = document.querySelector(".flagged-content");
    const profileBtn = document.getElementById("profile-btn");

    if (historyContent) {
        historyContent.style.paddingLeft = "2vh";
        historyContent.style.paddingRight = "2vh";
    }
    if (flaggedContent) {
        flaggedContent.style.paddingLeft = "2vh";
        flaggedContent.style.paddingRight = "2vh";
    }

    // Math Parser instance
    const parser = new MathParser();

    // State Variables
    let currentInput = "";
    let expression = "";
    let isEvaluated = false;
    let lastEvaluatedExpr = "";
    let lastEvaluatedResult = "";

    // Load and render history lists
    renderHistory();
    renderFlagged();

    // Toggle panels
    if (historyBtn && historyPanel) {
        historyBtn.addEventListener("click", () => {
            if (historyPanel.style.display === "none") {
                historyPanel.style.display = "flex";
            } else {
                historyPanel.style.display = "none";
            }
        });
    }

    if (flagBtn && flaggedPanel) {
        flagBtn.addEventListener("click", () => {
            if (flaggedPanel.style.display === "none") {
                flaggedPanel.style.display = "flex";
            } else {
                flaggedPanel.style.display = "none";
            }
        });
    }

    // Profile button click handler
    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            alert("Cal-EaZy App Profile\n\nProject by: Gautami Sheolikar\nStatus: Premium User");
        });
    }

    // Main button click handler
    const buttons = document.querySelectorAll(".cal-button button");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            handleInput(button.textContent.trim(), button);
        });
    });

    function handleInput(value, buttonEl = null) {
        // Simple scale click animation
        if (buttonEl) {
            buttonEl.style.transform = "scale(0.9)";
            setTimeout(() => buttonEl.style.transform = "", 100);
        }

        // Check if backspace (contains image or is delete button)
        if (value === "" && buttonEl && buttonEl.classList.contains("delete")) {
            value = "DEL";
        }

        if (/[0-9]/.test(value)) {
            handleDigit(value);
        } else if (value === ".") {
            handleDecimal();
        } else if (value === "C") {
            handleClear();
        } else if (value === "DEL") {
            handleBackspace();
        } else if (value === "( )") {
            handleBrackets();
        } else if (value === "%") {
            handlePercentage();
        } else if (["+", "-", "×", "÷"].includes(value)) {
            handleOperator(value);
        } else if (value === "=") {
            handleEquals();
        }
    }

    function handleDigit(digit) {
        if (isEvaluated) {
            currentInput = "";
            expression = "";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
        }
        if (currentInput === "0") {
            currentInput = digit;
        } else {
            currentInput += digit;
        }
        currDisplay.value = currentInput;
    }

    function handleDecimal() {
        if (isEvaluated) {
            currentInput = "0.";
            expression = "";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
        }
        if (!currentInput.includes(".")) {
            currentInput = currentInput === "" ? "0." : currentInput + ".";
        }
        currDisplay.value = currentInput;
    }

    function handleClear() {
        currentInput = "";
        expression = "";
        isEvaluated = false;
        lastEvaluatedExpr = "";
        lastEvaluatedResult = "";
        prevDisplay.textContent = "Previous-step";
        currDisplay.value = "";
        currDisplay.placeholder = "0";
    }

    function handleBackspace() {
        if (isEvaluated) {
            handleClear();
            return;
        }
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            currDisplay.value = currentInput || "";
            if (currentInput === "") {
                currDisplay.placeholder = "0";
            }
        }
    }

    function handleBrackets() {
        if (isEvaluated) {
            currentInput = "(";
            expression = "";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
            currDisplay.value = currentInput;
            return;
        }

        const openBrackets = (expression + currentInput).split("(").length - 1;
        const closeBrackets = (expression + currentInput).split(")").length - 1;
        const lastChar = currentInput.slice(-1) || expression.trim().slice(-1);

        if (openBrackets > closeBrackets && (/[0-9%]/.test(lastChar) || lastChar === ")")) {
            currentInput += ")";
        } else {
            if (/[0-9%]/.test(lastChar) || lastChar === ")") {
                currentInput += " × (";
            } else {
                currentInput += "(";
            }
        }
        currDisplay.value = currentInput;
    }

    function handlePercentage() {
        if (isEvaluated) {
            currentInput = currentInput + "%";
            expression = "";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
            currDisplay.value = currentInput;
            return;
        }
        if (currentInput !== "" && !currentInput.endsWith("%")) {
            currentInput += "%";
            currDisplay.value = currentInput;
        }
    }

    function handleOperator(op) {
        if (isEvaluated) {
            expression = currentInput + " " + op + " ";
            currentInput = "";
            isEvaluated = false;
            prevDisplay.textContent = expression;
            currDisplay.value = "";
            currDisplay.placeholder = "0";
            return;
        }

        if (currentInput !== "") {
            expression += currentInput + " " + op + " ";
            currentInput = "";
            prevDisplay.textContent = expression;
            currDisplay.value = "";
            currDisplay.placeholder = "0";
        } else if (expression !== "") {
            // Replace last operator
            expression = expression.trim().replace(/[\+\-×÷]$/, op) + " ";
            prevDisplay.textContent = expression;
        } else if (op === "-") {
            currentInput = "-";
            currDisplay.value = currentInput;
        }
    }

    function handleEquals() {
        if (expression === "" && currentInput === "") return;

        let fullExpr = expression + currentInput;
        const openBrackets = fullExpr.split("(").length - 1;
        const closeBrackets = fullExpr.split(")").length - 1;
        if (openBrackets > closeBrackets) {
            fullExpr += ")".repeat(openBrackets - closeBrackets);
        }

        try {
            const cleanExpr = fullExpr.replace(/×/g, "*").replace(/÷/g, "/");
            const result = parser.evaluate(cleanExpr);
            let formattedResult = Number(result.toFixed(10)).toString();

            prevDisplay.textContent = fullExpr + " =";
            currDisplay.value = formattedResult;

            lastEvaluatedExpr = fullExpr;
            lastEvaluatedResult = formattedResult;

            saveToHistory(fullExpr, formattedResult);
            currentInput = formattedResult;
            expression = "";
            isEvaluated = true;
        } catch (error) {
            currDisplay.value = "Error";
            isEvaluated = true;
            console.error(error);
        }
    }

    // Flag current result
    if (flagBtn) {
        flagBtn.addEventListener("click", () => {
            if (lastEvaluatedExpr && lastEvaluatedResult) {
                saveToFlagged(lastEvaluatedExpr, lastEvaluatedResult);
                // Animate flag button icon
                const img = flagBtn.querySelector("img");
                if (img) {
                    img.style.transform = "scale(1.3)";
                    setTimeout(() => img.style.transform = "", 150);
                }
            } else {
                alert("Calculate something first before flagging it!");
            }
        });
    }

    // History LocalStorage logic
    function saveToHistory(expr, result) {
        let history = JSON.parse(localStorage.getItem("norly_history") || "[]");
        if (history.length > 0 && history[0].expr === expr && history[0].result === result) return;

        history.unshift({ expr, result });
        if (history.length > 15) history.pop();
        localStorage.setItem("norly_history", JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if (!historyContent) return;
        let history = JSON.parse(localStorage.getItem("norly_history") || "[]");
        if (history.length === 0) {
            historyContent.innerHTML = `<p class="pretext">No Cal made yet! Maybe start with 2+2 ;)</p>`;
            return;
        }

        historyContent.innerHTML = "";
        history.forEach(item => {
            const div = document.createElement("div");
            // Style item dynamically using Javascript to respect untouched style.css
            div.style.cssText = "padding: 10px; margin: 8px 0; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; display: flex; flex-direction: column; gap: 3px; align-items: flex-end;";
            
            div.innerHTML = `
                <span style="font-family:'KoHo'; font-size:12px; color:#777;">${item.expr}</span>
                <span style="font-family:'KoHo'; font-weight:bold; font-size:16px; color:#000;">${item.result}</span>
            `;
            div.addEventListener("click", () => {
                loadCalculation(item.expr, item.result);
            });
            historyContent.appendChild(div);
        });
    }

    // Flagged LocalStorage logic
    function saveToFlagged(expr, result) {
        let flagged = JSON.parse(localStorage.getItem("norly_flagged") || "[]");
        if (flagged.some(item => item.expr === expr && item.result === result)) return;

        flagged.unshift({ expr, result });
        localStorage.setItem("norly_flagged", JSON.stringify(flagged));
        renderFlagged();
    }

    function renderFlagged() {
        if (!flaggedContent) return;
        let flagged = JSON.parse(localStorage.getItem("norly_flagged") || "[]");
        if (flagged.length === 0) {
            flaggedContent.innerHTML = `<p class="pretext">No Cal made yet! Maybe start with 2+2 ;)</p>`;
            return;
        }

        flaggedContent.innerHTML = "";
        flagged.forEach(item => {
            const div = document.createElement("div");
            div.style.cssText = "padding: 10px; margin: 8px 0; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; display: flex; flex-direction: column; gap: 3px; align-items: flex-end;";
            
            div.innerHTML = `
                <span style="font-family:'KoHo'; font-size:12px; color:#777;">${item.expr}</span>
                <span style="font-family:'KoHo'; font-weight:bold; font-size:16px; color:#000;">${item.result}</span>
            `;
            div.addEventListener("click", () => {
                loadCalculation(item.expr, item.result);
            });
            flaggedContent.appendChild(div);
        });
    }

    function loadCalculation(expr, result) {
        expression = "";
        currentInput = result;
        prevDisplay.textContent = expr + " =";
        currDisplay.value = result;
        isEvaluated = true;
        lastEvaluatedExpr = expr;
        lastEvaluatedResult = result;
    }

    // Keyboard support mapping
    document.addEventListener("keydown", (e) => {
        let key = e.key;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const allButtons = document.querySelectorAll(".cal-button button");
        let targetBtn = null;

        allButtons.forEach(btn => {
            const text = btn.textContent.trim();
            if (key === "Enter" && text === "=") targetBtn = btn;
            else if (key === "=" && text === "=") targetBtn = btn;
            else if (key === "Escape" && text === "C") targetBtn = btn;
            else if (key.toLowerCase() === "c" && text === "C") targetBtn = btn;
            else if (key === "Backspace" && btn.classList.contains("delete")) targetBtn = btn;
            else if (key === "+" && text === "+") targetBtn = btn;
            else if (key === "-" && text === "-") targetBtn = btn;
            else if (key === "*" && text === "×") targetBtn = btn;
            else if (key.toLowerCase() === "x" && text === "×") targetBtn = btn;
            else if (key === "/" && text === "÷") targetBtn = btn;
            else if (key === "%" && text === "%") targetBtn = btn;
            else if (key === "." && text === ".") targetBtn = btn;
            else if (key === "(" && text === "( )") targetBtn = btn;
            else if (key === ")" && text === "( )") targetBtn = btn;
            else if (text === key) targetBtn = btn;
        });

        if (targetBtn) {
            e.preventDefault();
            targetBtn.click();
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const prevDisplay = document.querySelector(".Previous-step");
    const currDisplay = document.querySelector(".Current-step");
    const historyBtn = document.getElementById("history-btn");
    const flagBtn = document.getElementById("flag-btn");
    const historyPanel = document.querySelector(".historycal");
    const flaggedPanel = document.querySelector(".flaggedcal");
    const historyContent = document.querySelector(".historycontnent");
    const flaggedContent = document.querySelector(".flagged-content");
    const modeToggleBtn = document.querySelector(".mode-toggle");
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
    let isDegMode = false; // default to Rad
    const parser = new MathParser(isDegMode);

    // State Variables
    let currentInput = "";
    let isEvaluated = false;
    let lastEvaluatedExpr = "";
    let lastEvaluatedResult = "";

    // Load History and Flagged on startup
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

    // Toggle Rad/Deg mode
    if (modeToggleBtn) {
        modeToggleBtn.addEventListener("click", () => {
            isDegMode = !isDegMode;
            parser.setDegMode(isDegMode);
            modeToggleBtn.textContent = isDegMode ? "Deg" : "Rad";
            
            // Visual bounce feedback
            modeToggleBtn.style.transform = "scale(0.9)";
            setTimeout(() => modeToggleBtn.style.transform = "", 100);

            // Re-evaluate if applicable
            if (isEvaluated && lastEvaluatedExpr) {
                try {
                    const cleanExpr = lastEvaluatedExpr
                        .replace(/×/g, "*")
                        .replace(/÷/g, "/")
                        .replace(/√/g, "sqrt")
                        .replace(/sin⁻¹/g, "asin")
                        .replace(/cos⁻¹/g, "acos")
                        .replace(/tan⁻¹/g, "atan");
                    const result = parser.evaluate(cleanExpr);
                    let formattedResult = Number(result.toFixed(10)).toString();
                    currDisplay.textContent = formattedResult;
                    currentInput = formattedResult;
                    lastEvaluatedResult = formattedResult;
                } catch (e) {
                    console.error(e);
                }
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
    const allButtons = document.querySelectorAll(".cal-button button");
    allButtons.forEach(button => {
        if (button.classList.contains("mode-toggle")) return; // handled separately

        button.addEventListener("click", () => {
            handleInput(button.textContent.trim(), button);
        });
    });

    function handleInput(value, buttonEl = null) {
        // Visual feedback
        if (buttonEl) {
            buttonEl.style.transform = "scale(0.9)";
            setTimeout(() => buttonEl.style.transform = "", 100);
        }

        // DEL button check (via image/class)
        if (value === "" && buttonEl && (buttonEl.classList.contains("deletes") || buttonEl.querySelector("img"))) {
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
        } else if (["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹", "log", "ln"].includes(value)) {
            handleFunction(value);
        } else if (value === "√") {
            handleFunction("√");
        } else if (value === "x²") {
            handlePowerSquared();
        } else if (value === "xʸ") {
            handleOperator("^");
        } else if (value === "x!") {
            handlePostfix("!");
        } else if (value === "1/x") {
            handleReciprocal();
        } else if (value === "π" || value === "e") {
            handleConstant(value);
        } else if (value === "=") {
            handleEquals();
        }
    }

    function handleDigit(digit) {
        if (isEvaluated) {
            currentInput = "";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
        }
        if (currentInput === "0") {
            currentInput = digit;
        } else {
            currentInput += digit;
        }
        currDisplay.textContent = currentInput;
    }

    function handleDecimal() {
        if (isEvaluated) {
            currentInput = "0.";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
        }
        const segments = currentInput.split(/[\+\-×÷\(\)\^]/);
        const lastSegment = segments[segments.length - 1];
        if (!lastSegment.includes(".")) {
            currentInput += currentInput === "" ? "0." : ".";
        }
        currDisplay.textContent = currentInput;
    }

    function handleClear() {
        currentInput = "";
        isEvaluated = false;
        lastEvaluatedExpr = "";
        lastEvaluatedResult = "";
        prevDisplay.textContent = "Previous-step";
        currDisplay.textContent = "0";
    }

    function handleBackspace() {
        if (isEvaluated) {
            handleClear();
            return;
        }
        if (currentInput.length > 0) {
            const functionPatterns = /(sin⁻¹\(|cos⁻¹\(|tan⁻¹\(|sin\(|cos\(|tan\(|log\(|ln\(|sqrt\()$/;
            const match = currentInput.match(functionPatterns);
            if (match) {
                currentInput = currentInput.slice(0, -match[0].length);
            } else {
                currentInput = currentInput.slice(0, -1);
            }
            currDisplay.textContent = currentInput || "0";
        }
    }

    function handleBrackets() {
        if (isEvaluated) {
            currentInput = "(";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
            currDisplay.textContent = currentInput;
            return;
        }

        const openCount = currentInput.split("(").length - 1;
        const closeCount = currentInput.split(")").length - 1;
        const lastChar = currentInput.slice(-1);

        if (openCount > closeCount && (/[0-9eπ%!]$/.test(lastChar) || lastChar === ")")) {
            currentInput += ")";
        } else {
            if (/[0-9eπ%!]$/.test(lastChar) || lastChar === ")") {
                currentInput += " × (";
            } else {
                currentInput += "(";
            }
        }
        currDisplay.textContent = currentInput;
    }

    function handlePercentage() {
        if (isEvaluated) {
            currentInput = currentInput + "%";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
            currDisplay.textContent = currentInput;
            return;
        }
        if (currentInput !== "" && !currentInput.endsWith("%")) {
            currentInput += "%";
            currDisplay.textContent = currentInput;
        }
    }

    function handleOperator(op) {
        if (isEvaluated) {
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
        }
        
        let displayOp = op;
        if (op === "^") displayOp = "^";

        const lastChar = currentInput.trim().slice(-1);
        if (["+", "-", "×", "÷", "^"].includes(lastChar)) {
            currentInput = currentInput.trim().slice(0, -1) + displayOp;
        } else {
            currentInput += " " + displayOp + " ";
        }
        currDisplay.textContent = currentInput;
    }

    function handleFunction(func) {
        if (isEvaluated) {
            currentInput = "";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
        }
        
        const lastChar = currentInput.slice(-1);
        if (/[0-9eπ%!]$/.test(lastChar) || lastChar === ")") {
            currentInput += " × " + func + "(";
        } else {
            currentInput += func + "(";
        }
        currDisplay.textContent = currentInput;
    }

    function handlePowerSquared() {
        if (isEvaluated) {
            currentInput = currentInput + "^2";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
            currDisplay.textContent = currentInput;
            return;
        }
        currentInput += "^2";
        currDisplay.textContent = currentInput;
    }

    function handlePostfix(op) {
        if (isEvaluated) {
            currentInput = currentInput + op;
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
            currDisplay.textContent = currentInput;
            return;
        }
        if (currentInput !== "") {
            currentInput += op;
            currDisplay.textContent = currentInput;
        }
    }

    function handleReciprocal() {
        if (isEvaluated) {
            currentInput = "1/(" + currentInput + ")";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
            currDisplay.textContent = currentInput;
            return;
        }
        if (currentInput === "") {
            currentInput = "1/";
        } else {
            currentInput = "1/(" + currentInput + ")";
        }
        currDisplay.textContent = currentInput;
    }

    function handleConstant(constant) {
        if (isEvaluated) {
            currentInput = "";
            isEvaluated = false;
            prevDisplay.textContent = "Previous-step";
        }
        const lastChar = currentInput.slice(-1);
        if (/[0-9eπ%!]$/.test(lastChar) || lastChar === ")") {
            currentInput += " × " + constant;
        } else {
            currentInput += constant;
        }
        currDisplay.textContent = currentInput;
    }

    function handleEquals() {
        if (currentInput === "") return;

        let fullExpr = currentInput;
        const openCount = fullExpr.split("(").length - 1;
        const closeCount = fullExpr.split(")").length - 1;
        if (openCount > closeCount) {
            fullExpr += ")".repeat(openCount - closeCount);
        }

        try {
            const cleanExpr = fullExpr
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/√/g, "sqrt")
                .replace(/sin⁻¹/g, "asin")
                .replace(/cos⁻¹/g, "acos")
                .replace(/tan⁻¹/g, "atan");

            const result = parser.evaluate(cleanExpr);
            let formattedResult = Number(result.toFixed(10)).toString();

            prevDisplay.textContent = fullExpr + " =";
            currDisplay.textContent = formattedResult;

            lastEvaluatedExpr = fullExpr;
            lastEvaluatedResult = formattedResult;

            saveToHistory(fullExpr, formattedResult);
            currentInput = formattedResult;
            isEvaluated = true;
        } catch (error) {
            currDisplay.textContent = "Error";
            isEvaluated = true;
            console.error(error);
        }
    }

    // Flag current calculation
    const originalFlagBtn = document.querySelector(".flaggedd-link");
    if (originalFlagBtn) {
        originalFlagBtn.addEventListener("click", () => {
            if (lastEvaluatedExpr && lastEvaluatedResult) {
                saveToFlagged(lastEvaluatedExpr, lastEvaluatedResult);
                const flagImg = originalFlagBtn.querySelector("img");
                if (flagImg) {
                    flagImg.style.transform = "scale(1.3)";
                    setTimeout(() => flagImg.style.transform = "", 150);
                }
            } else {
                alert("Calculate something first before flagging it!");
            }
        });
    }

    // History LocalStorage logic
    function saveToHistory(expr, result) {
        let history = JSON.parse(localStorage.getItem("sciency_history") || "[]");
        if (history.length > 0 && history[0].expr === expr && history[0].result === result) return;

        history.unshift({ expr, result });
        if (history.length > 15) history.pop();
        localStorage.setItem("sciency_history", JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if (!historyContent) return;
        let history = JSON.parse(localStorage.getItem("sciency_history") || "[]");
        if (history.length === 0) {
            historyContent.innerHTML = `<p class="pretext">No Cal made yet! Maybe start with 2+2 ;)</p>`;
            return;
        }

        historyContent.innerHTML = "";
        history.forEach(item => {
            const div = document.createElement("div");
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
        let flagged = JSON.parse(localStorage.getItem("sciency_flagged") || "[]");
        if (flagged.some(item => item.expr === expr && item.result === result)) return;

        flagged.unshift({ expr, result });
        localStorage.setItem("sciency_flagged", JSON.stringify(flagged));
        renderFlagged();
    }

    function renderFlagged() {
        if (!flaggedContent) return;
        let flagged = JSON.parse(localStorage.getItem("sciency_flagged") || "[]");
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
        currentInput = expr;
        prevDisplay.textContent = expr + " =";
        currDisplay.textContent = result;
        isEvaluated = true;
        lastEvaluatedExpr = expr;
        lastEvaluatedResult = result;
    }

    // Keyboard support mapping
    document.addEventListener("keydown", (e) => {
        let key = e.key;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        let targetBtn = null;
        const allButtons = document.querySelectorAll(".cal-button button");
        
        allButtons.forEach(btn => {
            const text = btn.textContent.trim();
            if (key === "Enter" && text === "=") targetBtn = btn;
            else if (key === "=" && text === "=") targetBtn = btn;
            else if (key === "Escape" && text === "C") targetBtn = btn;
            else if (key.toLowerCase() === "c" && text === "C") targetBtn = btn;
            else if (key === "Backspace" && btn.classList.contains("deletes")) targetBtn = btn;
            else if (key === "+" && text === "+") targetBtn = btn;
            else if (key === "-" && text === "-") targetBtn = btn;
            else if (key === "*" && text === "×") targetBtn = btn;
            else if (key.toLowerCase() === "x" && text === "×") targetBtn = btn;
            else if (key === "/" && text === "÷") targetBtn = btn;
            else if (key === "%" && text === "%") targetBtn = btn;
            else if (key === "." && text === ".") targetBtn = btn;
            else if (key === "(" && text === "( )") targetBtn = btn;
            else if (key === ")" && text === "( )") targetBtn = btn;
            else if (key === "^" && text === "xʸ") targetBtn = btn;
            else if (key === "!" && text === "x!") targetBtn = btn;
            else if (key.toLowerCase() === "s" && text === "sin") targetBtn = btn;
            else if (key.toLowerCase() === "o" && text === "cos") targetBtn = btn;
            else if (key.toLowerCase() === "t" && text === "tan") targetBtn = btn;
            else if (key.toLowerCase() === "l" && text === "log") targetBtn = btn;
            else if (key.toLowerCase() === "n" && text === "ln") targetBtn = btn;
            else if (key.toLowerCase() === "q" && text === "√") targetBtn = btn;
            else if (key.toLowerCase() === "p" && text === "π") targetBtn = btn;
            else if (key.toLowerCase() === "e" && text === "e") targetBtn = btn;
            else if (key.toLowerCase() === "r" && btn.classList.contains("mode-toggle")) targetBtn = btn;
            else if (text === key) targetBtn = btn;
        });

        if (targetBtn) {
            e.preventDefault();
            targetBtn.click();
        }
    });
});

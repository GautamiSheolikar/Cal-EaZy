document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const optionsBtn = document.querySelector(".options");
    const closeBtn = document.querySelector(".close");
    const optionsMenu = document.querySelector(".optionsmenu");
    const plusBtn = document.querySelector(".plus");
    const mediaContainer = document.querySelector(".searchmedia");
    const recorderBtn = document.querySelector(".recorder");
    const entreBtn = document.querySelector(".entre");
    const searchInput = document.querySelector(".search-input");
    const heroSection = document.querySelector(".helhomherosection");
    const profileBtn = document.getElementById("profile-btn");

    // Dynamic File Input for simulating file attachments
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    fileInput.accept = "image/*,video/*,.pdf,.txt,.doc,.docx";
    document.body.appendChild(fileInput);

    // Submenu links
    const newSessionOpt = document.querySelectorAll(".opt")[0];
    const chatHistoryOpt = document.querySelectorAll(".opt")[1];
    const flaggedChatsOpt = document.querySelectorAll(".opt")[2];

    // Math parser instance (for parsing basic arithmetic in chats)
    const parser = new MathParser();

    // Chat threads list
    let chatThreads = JSON.parse(localStorage.getItem("helhom_chats") || "[]");
    let currentThreadId = null;
    let chatContainer = null;

    // Inject chat styling dynamically to respect original style.css
    const styleEl = document.createElement("style");
    styleEl.textContent = `
        .chat-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 800px;
            height: 380px;
            margin: 20px auto;
            background: rgba(221, 231, 242, 0.9);
            border-radius: 20px;
            border: 1px solid rgba(0,0,0,0.1);
            padding: 15px;
            overflow-y: auto;
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);
        }
        .chat-message {
            display: flex;
            flex-direction: column;
            margin-bottom: 12px;
            max-width: 80%;
        }
        .chat-message.user {
            align-self: flex-end;
            align-items: flex-end;
        }
        .chat-message.ai {
            align-self: flex-start;
            align-items: flex-start;
        }
        .message-content {
            padding: 10px 14px;
            border-radius: 16px;
            font-family: 'KoHo';
            font-size: 15px;
            line-height: 1.4;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .chat-message.user .message-content {
            background: #4E220F;
            color: #F7F1DE;
            border-bottom-right-radius: 16px;
            border-bottom-left-radius: 16px;
        }
        .chat-message.ai .message-content {
            background: #fff;
            color: #000;
            border-bottom-left-radius: 16px;
            border-bottom-right-radius: 16px;
            border: 1px solid #ddd;
        }
        .chat-message.ai strong {
            color: #4E220F;
        }
        .step-box {
            background: rgba(157, 102, 56, 0.08);
            border: 1px dashed #9D6638;
            border-radius: 6px;
            padding: 6px 10px;
            margin: 6px 0;
            font-family: 'Itim';
        }
        .final-answer {
            background: #E4FDB9;
            border: 1px solid #9D6638;
            padding: 6px 10px;
            border-radius: 6px;
            margin-top: 6px;
            font-weight: bold;
            color: #4E220F;
        }
        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 10px 14px;
            background: #fff;
            border-radius: 16px;
            border-bottom-left-radius: 4px;
            align-self: flex-start;
            border: 1px solid #ddd;
        }
        .typing-dot {
            width: 6px;
            height: 6px;
            background: #9D6638;
            border-radius: 50%;
            animation: typingBounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        .typing-dot:nth-child(3) { animation-delay: -0.08s; }
        @keyframes typingBounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    `;
    document.head.appendChild(styleEl);

    // Initial state
    if (recorderBtn) recorderBtn.style.display = "flex";
    if (entreBtn) entreBtn.style.display = "none";
    if (optionsMenu) optionsMenu.style.display = "none";
    if (mediaContainer) mediaContainer.style.display = "none";

    // Options Menu Toggle
    if (optionsBtn && optionsMenu) {
        optionsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            optionsMenu.style.display = optionsMenu.style.display === "flex" ? "none" : "flex";
        });
    }

    if (closeBtn && optionsMenu) {
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            optionsMenu.style.display = "none";
        });
    }

    document.addEventListener("click", (e) => {
        if (optionsMenu && !optionsMenu.contains(e.target) && e.target !== optionsBtn) {
            optionsMenu.style.display = "none";
        }
    });

    // Profile button click handler
    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            alert("Cal-EaZy App Profile\n\nProject by: Gautami Sheolikar\nStatus: Premium User");
        });
    }

    // Options Submenu Actions
    if (newSessionOpt) {
        newSessionOpt.addEventListener("click", () => {
            optionsMenu.style.display = "none";
            startNewThread();
        });
    }

    if (chatHistoryOpt) {
        chatHistoryOpt.addEventListener("click", () => {
            optionsMenu.style.display = "none";
            showChatHistoryList();
        });
    }

    if (flaggedChatsOpt) {
        flaggedChatsOpt.addEventListener("click", () => {
            optionsMenu.style.display = "none";
            showFlaggedChatsList();
        });
    }

    // Media Options Tray Toggle
    if (plusBtn && mediaContainer) {
        plusBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mediaContainer.style.display === "flex";
            mediaContainer.style.display = isOpen ? "none" : "flex";
            plusBtn.style.transform = isOpen ? "" : "rotate(135deg)";
            plusBtn.style.transition = "transform 0.2s ease";
        });
    }

    // Media Buttons Attachment Trigger
    const mediaButtons = document.querySelectorAll(".searchmedia button");
    mediaButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (fileInput) {
                if (btn.classList.contains("image")) {
                    fileInput.accept = "image/*";
                } else if (btn.classList.contains("video")) {
                    fileInput.accept = "video/*";
                } else {
                    fileInput.accept = ".pdf,.txt,.doc,.docx";
                }
                fileInput.click();
            }
        });
    });

    // Handle Mock File selection & simulation
    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                simulateFileUpload(file);
                // Collapse media panel
                plusBtn.style.transform = "";
                mediaContainer.style.display = "none";
            }
        });
    }

    // Dynamic searchbar action buttons switch
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const hasText = searchInput.value.trim() !== "";
            if (hasText) {
                if (recorderBtn) recorderBtn.style.display = "none";
                if (entreBtn) entreBtn.style.display = "flex";
            } else {
                if (entreBtn) entreBtn.style.display = "none";
                if (recorderBtn) recorderBtn.style.display = "flex";
            }
        });

        // Trigger on Enter
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendQuery();
            }
        });
    }

    // Send Button click
    if (entreBtn) {
        entreBtn.addEventListener("click", () => {
            sendQuery();
        });
    }

    // Voice typing simulation
    if (recorderBtn) {
        recorderBtn.addEventListener("click", () => {
            simulateVoiceInput();
        });
    }

    function ensureChatContainer() {
        if (!chatContainer) {
            chatContainer = document.createElement("div");
            chatContainer.className = "chat-container";
            chatContainer.id = "chat-container";
            
            // Insert it inside helhomherosection above the search widget
            const searchWidget = document.querySelector(".searchwiget");
            if (searchWidget) {
                heroSection.insertBefore(chatContainer, searchWidget);
            }
        }
    }

    // Solve the query and add to list
    function sendQuery() {
        const text = searchInput.value.trim();
        if (!text) return;

        // Clear input and toggle icons
        searchInput.value = "";
        if (entreBtn) entreBtn.style.display = "none";
        if (recorderBtn) recorderBtn.style.display = "flex";

        // Activate chat interface layout
        activateChatView();

        // 1. Add User Message
        addChatMessage("user", text);

        // 2. Trigger Typing Indicator
        const typingEl = showTypingIndicator();

        // 3. AI Solver Simulation
        setTimeout(() => {
            removeTypingIndicator(typingEl);
            const aiSolution = generateMathExplanation(text);
            addChatMessage("ai", aiSolution);
            saveCurrentThread();
        }, 1500);
    }

    // Simulated file uploading progress
    function simulateFileUpload(file) {
        activateChatView();

        const progressMessage = `Uploading file: <strong>${file.name}</strong>... <br><div style="width:100%; background:#ddd; height:8px; border-radius:4px; margin-top:5px; overflow:hidden;"><div id="upload-prog" style="background:#9D6638; width:0%; height:100%; transition: width 0.1s ease;"></div></div>`;
        const uploadMsgEl = addChatMessage("user", progressMessage);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            const progBar = uploadMsgEl.querySelector("#upload-prog");
            if (progBar) progBar.style.width = progress + "%";

            if (progress >= 100) {
                clearInterval(interval);
                uploadMsgEl.querySelector(".message-content").innerHTML = `Uploaded File: <strong>${file.name}</strong> (${Math.round(file.size / 1024)} KB)`;
                
                const typingEl = showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator(typingEl);
                    const aiSolution = generateFileSolution(file.name);
                    addChatMessage("ai", aiSolution);
                    saveCurrentThread();
                }, 1500);
            }
        }, 150);
    }

    // Simulated voice recording dictation
    function simulateVoiceInput() {
        if (!searchInput) return;
        searchInput.disabled = true;
        searchInput.placeholder = "Listening... Speak now...";
        if (recorderBtn) {
            recorderBtn.style.transform = "scale(1.2)";
        }

        const voiceQueries = [
            "solve 2x + 7 = 19",
            "what is the derivative of 4x^3 + 5x?",
            "explain the pythagorean theorem",
            "find the roots of quadratic equation x^2 - 7x + 12 = 0",
            "what is the area of a circle with radius 7?"
        ];
        const selectedQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];

        setTimeout(() => {
            searchInput.placeholder = "Type Something...";
            searchInput.disabled = false;
            if (recorderBtn) {
                recorderBtn.style.transform = "";
            }

            // Simulate typing letter by letter
            let typedText = "";
            let idx = 0;
            const typingInterval = setInterval(() => {
                typedText += selectedQuery[idx];
                searchInput.value = typedText;
                idx++;

                // Trigger icons switch
                if (recorderBtn) recorderBtn.style.display = "none";
                if (entreBtn) entreBtn.style.display = "flex";

                if (idx >= selectedQuery.length) {
                    clearInterval(typingInterval);
                }
            }, 50);

        }, 1800);
    }

    // Dynamic Math solver & logic
    function generateMathExplanation(query) {
        const cleanQuery = query.toLowerCase().trim();

        // 1. Quadratic Equation
        const quadraticRegex = /x\^2\s*([+-]\s*\d*)x\s*([+-]\s*\d+)?\s*=\s*0/;
        const quadMatch = cleanQuery.match(quadraticRegex);
        if (quadMatch) {
            let bValStr = quadMatch[1].replace(/\s+/g, "");
            let cValStr = (quadMatch[2] || "").replace(/\s+/g, "");

            let b = bValStr === "+" || bValStr === "" ? 1 : bValStr === "-" ? -1 : parseFloat(bValStr);
            let c = cValStr ? parseFloat(cValStr) : 0;
            let d = b*b - 4*1*c;

            let response = `<h3>Quadratic Equation Solver</h3>`;
            response += `<p>Solving equation: <strong>x² ${b >= 0 ? "+ " + b : b}x ${c >= 0 ? "+ " + c : c} = 0</strong></p>`;
            
            response += `<div class="step-box">`;
            response += `<strong>Step 1: Compute discriminant (D):</strong><br>`;
            response += `D = b² - 4ac = (${b})² - 4(1)(${c}) = <strong>${d}</strong>`;
            response += `</div>`;

            if (d < 0) {
                let realPart = (-b / 2).toFixed(2);
                let imagPart = (Math.sqrt(-d) / 2).toFixed(2);
                response += `<div class="final-answer">`;
                response += `Complex Roots: x = ${realPart} ± ${imagPart}i`;
                response += `</div>`;
            } else {
                let r1 = (-b + Math.sqrt(d)) / 2;
                let r2 = (-b - Math.sqrt(d)) / 2;
                response += `<div class="step-box">`;
                response += `<strong>Step 2: Solve roots using quadratic formula:</strong><br>`;
                response += `x = [-b ± √D] / 2a = [${-b} ± √${d}] / 2`;
                response += `</div>`;
                response += `<div class="final-answer">`;
                response += `Roots: x₁ = ${r1}, x₂ = ${r2}`;
                response += `</div>`;
            }
            return response;
        }

        // 2. Linear Equation
        const linearRegex = /solve\s+([+-]?\d*)x\s*([+-]\s*\d+)?\s*=\s*([+-]?\d+)/;
        const linearMatch = cleanQuery.match(linearRegex);
        if (linearMatch) {
            let aStr = linearMatch[1].replace(/\s+/g, "");
            let bStr = (linearMatch[2] || "").replace(/\s+/g, "");
            let cStr = linearMatch[3].replace(/\s+/g, "");

            let a = aStr === "+" || aStr === "" ? 1 : aStr === "-" ? -1 : parseFloat(aStr);
            let b = bStr ? parseFloat(bStr) : 0;
            let c = parseFloat(cStr);

            let response = `<h3>Linear Equation Solver</h3>`;
            response += `<p>Solving equation: <strong>${a}x ${b >= 0 ? "+ " + b : b} = ${c}</strong></p>`;
            
            response += `<div class="step-box">`;
            response += `<strong>Step 1: Isolate variable term:</strong><br>`;
            response += `${a}x = ${c} - (${b}) = ${c - b}`;
            response += `</div>`;

            let sol = (c - b) / a;
            response += `<div class="step-box">`;
            response += `<strong>Step 2: Solve for x:</strong><br>`;
            response += `x = ${c - b} / ${a} = <strong>${sol}</strong>`;
            response += `</div>`;

            response += `<div class="final-answer">`;
            response += `Solution: x = ${sol}`;
            response += `</div>`;
            return response;
        }

        // 3. Derivative
        if (cleanQuery.includes("deriv")) {
            let response = `<h3>Calculus Solver: Differentiation</h3>`;
            response += `<p>Finding derivative of polynomial term.</p>`;
            response += `<div class="step-box">`;
            response += `<strong>Core Theorem: The Power Rule</strong><br>`;
            response += `d/dx [xⁿ] = n · xⁿ⁻¹`;
            response += `</div>`;

            if (cleanQuery.includes("x^2") || cleanQuery.includes("x²")) {
                response += `<div class="step-box">`;
                response += `<strong>Application:</strong><br>`;
                response += `d/dx [3x² + 5x] = 3 · (2x) + 5 · (1) = 6x + 5`;
                response += `</div>`;
                
                response += `<div class="final-answer">`;
                response += `Result: 6x + 5`;
                response += `</div>`;
            } else {
                response += `<div class="final-answer">`;
                response += `Result: d/dx [x³] = 3x²`;
                response += `</div>`;
            }
            return response;
        }

        // 4. Integrals
        if (cleanQuery.includes("integral") || cleanQuery.includes("integrate")) {
            let response = `<h3>Calculus Solver: Integration</h3>`;
            response += `<p>Calculating indefinite integral of polynomial.</p>`;
            response += `<div class="step-box">`;
            response += `<strong>Core Theorem: Power Rule for Integration</strong><br>`;
            response += `∫ xⁿ dx = xⁿ⁺¹ / (n + 1) + C`;
            response += `</div>`;
            response += `<div class="step-box">`;
            response += `∫ x² dx = x³ / 3 + C`;
            response += `</div>`;
            response += `<div class="final-answer">`;
            response += `Result: ⅓ x³ + C`;
            response += `</div>`;
            return response;
        }

        // 5. Pythagorean Theorem
        if (cleanQuery.includes("pythagorean") || cleanQuery.includes("triangle")) {
            let response = `<h3>Geometric Solver</h3>`;
            response += `<p><strong>Pythagorean Theorem:</strong> In a right-angled triangle, side a, b, and hypotenuse c follow:</p>`;
            response += `<p style="text-align:center;"><strong>a² + b² = c²</strong></p>`;
            response += `<div class="step-box">`;
            response += `For side a = 3 cm, side b = 4 cm:<br>`;
            response += `c = √(3² + 4²) = √(9 + 16) = √25 = <strong>5 cm</strong>`;
            response += `</div>`;
            response += `<div class="final-answer">`;
            response += `Hypotenuse: 5 cm`;
            response += `</div>`;
            return response;
        }

        // 6. Circle Area
        if (cleanQuery.includes("area") && cleanQuery.includes("circle")) {
            let response = `<h3>Circle Area Solver</h3>`;
            response += `<p>Formula: <strong>A = πr²</strong></p>`;
            response += `<div class="step-box">`;
            response += `For radius r = 7 cm:<br>`;
            response += `A = π · 7² = 49π ≈ <strong>153.94 cm²</strong>`;
            response += `</div>`;
            response += `<div class="final-answer">`;
            response += `Area: 153.94 cm²`;
            response += `</div>`;
            return response;
        }

        // 7. Try direct arithmetic evaluation
        try {
            const testExpr = cleanQuery.replace(/×/g, "*").replace(/÷/g, "/");
            if (/^[0-9\+\-\*\/\(\)\s\%\^\.eπ]+$/.test(testExpr)) {
                const evalVal = parser.evaluate(testExpr);
                let response = `<h3>Arithmetic Solver</h3>`;
                response += `<p>Evaluating: <strong>${query}</strong></p>`;
                response += `<div class="final-answer">`;
                response += `Result: ${Number(evalVal.toFixed(10)).toString()}`;
                response += `</div>`;
                return response;
            }
        } catch (e) {}

        // 8. General AI helper message
        let response = `<h3>AI Homework Helper</h3>`;
        response += `<p>Hello! I can explain and solve mathematical homework questions. Try typing:</p>`;
        response += `<ul>`;
        response += `<li><code>solve x^2 - 7x + 12 = 0</code></li>`;
        response += `<li><code>solve 4x + 10 = 30</code></li>`;
        response += `<li><code>derivative of 3x^2 + 5x</code></li>`;
        response += `<li><code>pythagorean theorem</code></li>`;
        response += `<li><code>125 * (4 - 2) / 5</code></li>`;
        response += `</ul>`;
        return response;
    }

    // Solver logic for file attachments
    function generateFileSolution(fileName) {
        let response = `<h3>AI Document Scanner Results</h3>`;
        response += `<p>Scanned math exercises in <strong>${fileName}</strong>:</p>`;
        
        if (fileName.match(/\.(png|jpg|jpeg|gif)$/i)) {
            response += `<p><em>[Image Scan] Identified geometry problem:</em></p>`;
            response += `<div class="step-box">`;
            response += `<strong>Problem:</strong> Find the height (h) of a pole casting a 12m shadow when the angle of elevation is 30°.<br>`;
            response += `<strong>Formula:</strong> h = 12 · tan(30°)`;
            response += `</div>`;
            response += `<div class="final-answer">`;
            response += `Result: h ≈ 6.93 meters`;
            response += `</div>`;
        } else {
            response += `<p><em>[Document Text Scan] Identified algebra problem:</em></p>`;
            response += `<div class="step-box">`;
            response += `<strong>Problem:</strong> Solve log(x) + log(x - 3) = 1.<br>`;
            response += `x(x - 3) = 10¹ &rArr; x² - 3x - 10 = 0 &rArr; (x - 5)(x + 2) = 0`;
            response += `</div>`;
            response += `<div class="final-answer">`;
            response += `Result: x = 5`;
            response += `</div>`;
        }
        return response;
    }

    // Chat rendering utilities
    function addChatMessage(sender, content) {
        ensureChatContainer();

        const messageEl = document.createElement("div");
        messageEl.className = `chat-message ${sender}`;
        messageEl.innerHTML = `<div class="message-content">${content}</div>`;
        chatContainer.appendChild(messageEl);

        chatContainer.scrollTop = chatContainer.scrollHeight;
        return messageEl;
    }

    function showTypingIndicator() {
        ensureChatContainer();

        const typingEl = document.createElement("div");
        typingEl.className = "typing-indicator";
        typingEl.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatContainer.appendChild(typingEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return typingEl;
    }

    function removeTypingIndicator(indicatorEl) {
        if (indicatorEl && indicatorEl.parentNode) {
            indicatorEl.parentNode.removeChild(indicatorEl);
        }
    }

    function activateChatView() {
        ensureChatContainer();
        
        // Hide hero text to make room for chat
        const titleH1 = document.querySelector(".helhomherosection h1");
        const titleH2 = document.querySelector(".helhomherosection h2");
        if (titleH1) titleH1.style.display = "none";
        if (titleH2) titleH2.style.display = "none";
        
        // Style container visibility
        chatContainer.style.display = "flex";

        if (!currentThreadId) {
            currentThreadId = "thread_" + Date.now();
        }
    }

    // History and Flagged Thread Persistence
    function saveCurrentThread() {
        if (!currentThreadId) return;

        const messages = [];
        const msgElems = document.querySelectorAll(".chat-message");
        msgElems.forEach(el => {
            const sender = el.classList.contains("user") ? "user" : "ai";
            const content = el.querySelector(".message-content").innerHTML;
            messages.push({ sender, content });
        });

        if (messages.length === 0) return;

        const userMsg = messages.find(m => m.sender === "user");
        let title = userMsg ? userMsg.content : "Math Chat Thread";
        title = title.replace(/<[^>]*>/g, "").substring(0, 25) + "...";

        const idx = chatThreads.findIndex(t => t.id === currentThreadId);
        if (idx !== -1) {
            chatThreads[idx].messages = messages;
        } else {
            chatThreads.unshift({
                id: currentThreadId,
                title: title,
                messages: messages,
                flagged: false
            });
        }

        localStorage.setItem("helhom_chats", JSON.stringify(chatThreads));
    }

    function showChatHistoryList() {
        activateChatView();
        chatContainer.innerHTML = `<h3 style="font-family:'KoHo'; margin-top:0;">Homework Chat History</h3>`;
        
        if (chatThreads.length === 0) {
            chatContainer.innerHTML += `<p class="pretext">No chats saved yet! Try typing a homework question below.</p>`;
            return;
        }

        chatThreads.forEach(thread => {
            const div = document.createElement("div");
            div.style.cssText = "padding: 10px; margin: 8px 0; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;";
            div.innerHTML = `
                <span style="font-family:'KoHo'; font-size:15px; font-weight:bold;">${thread.title}</span>
                <div>
                    <button class="flag-thread-btn" style="background:none; border:none; padding:4px; margin-right:8px; cursor:pointer;">
                        <img src="icon/Flag.svg" alt="Flag" style="width:16px; filter:${thread.flagged ? 'none' : 'grayscale(100%)'}">
                    </button>
                    <span style="font-size:12px; color:#888;">${thread.messages.length} messages</span>
                </div>
            `;
            
            div.addEventListener("click", (e) => {
                const flagBtnEl = div.querySelector(".flag-thread-btn");
                if (flagBtnEl && flagBtnEl.contains(e.target)) {
                    e.stopPropagation();
                    thread.flagged = !thread.flagged;
                    localStorage.setItem("helhom_chats", JSON.stringify(chatThreads));
                    showChatHistoryList();
                    return;
                }
                loadChatThread(thread);
            });
            chatContainer.appendChild(div);
        });

        // Add a "New Chat" button
        const newChatDiv = document.createElement("div");
        newChatDiv.style.cssText = "padding: 10px; margin: 15px 0 0 0; background: #E4FDB9; border-radius: 8px; cursor: pointer; text-align: center;";
        newChatDiv.innerHTML = `<span style="font-family:'KoHo'; font-weight:bold; color:#4E220F;">+ Start a New Homework Session</span>`;
        newChatDiv.addEventListener("click", () => {
            startNewThread();
        });
        chatContainer.appendChild(newChatDiv);
    }

    function showFlaggedChatsList() {
        activateChatView();
        chatContainer.innerHTML = `<h3 style="font-family:'KoHo'; margin-top:0;">Flagged Homework Chats</h3>`;
        
        const flagged = chatThreads.filter(t => t.flagged);
        if (flagged.length === 0) {
            chatContainer.innerHTML += `<p class="pretext">No flagged chat threads yet! Use Chats History to flag active items.</p>`;
            return;
        }

        flagged.forEach(thread => {
            const div = document.createElement("div");
            div.style.cssText = "padding: 10px; margin: 8px 0; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;";
            div.innerHTML = `
                <span style="font-family:'KoHo'; font-size:15px; font-weight:bold;">${thread.title}</span>
                <span style="font-size:12px; color:#888;">${thread.messages.length} messages</span>
            `;
            div.addEventListener("click", () => {
                loadChatThread(thread);
            });
            chatContainer.appendChild(div);
        });
    }

    function loadChatThread(thread) {
        currentThreadId = thread.id;
        chatContainer.innerHTML = "";
        thread.messages.forEach(msg => {
            addChatMessage(msg.sender, msg.content);
        });
    }

    function startNewThread() {
        currentThreadId = null;
        if (chatContainer) {
            chatContainer.innerHTML = "";
            chatContainer.style.display = "none";
        }
        const titleH1 = document.querySelector(".helhomherosection h1");
        const titleH2 = document.querySelector(".helhomherosection h2");
        if (titleH1) titleH1.style.display = "flex";
        if (titleH2) titleH2.style.display = "block";
    }
});

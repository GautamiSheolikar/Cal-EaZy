# 🧮 Cal-EaZy 2.0

**Cal-EaZy 2.0** is an elegant, feature-rich, and interactive web-based calculator suite designed to simplify everything from daily arithmetic to complex scientific calculations and math homework. Built completely using a **Vanilla Web Stack** (HTML, CSS, and JS) without external frameworks, it features a custom expression parser, persistent user state storage, and a simulated AI homework assistant.

Designed and developed by **[Gautami Sheolikar](https://github.com/GautamiSheolikar)**.

[![Figma Design](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/design/As4YjQlWaCFxvBTNfmvtU1/Cal-EaZy?node-id=0-1&t=111YJTLTTenfCl6K-1)

---

## 💡 Project Backstory & Motivation

> Everyone builds a calculator when they first start coding. I was initially hesitant to build one since it seemed so common, but I soon realized why it's a rite of passage: it's a fantastic learning curve! 
>
> I am very excited to introduce **Cal-EaZy**. I built this with my own school days in mind. I remember every academic struggle, and especially the hesitation I used to feel when asking for help in class. My hope is that this app will provide a safe, interactive helper for introverted or shy students who want to learn and practice math at their own pace.
>
> **Note on the "AI":** 
> To keep the app fast, offline-friendly, and eco-friendly, the homework solver does not call power-hungry cloud LLM APIs (meaning it is water-free and doesn't rely on server-farm cooling systems!). Instead, it is a smart suite of client-side mathematical algorithms and pattern-matching logic that solves algebra, calculus, and geometry problems step-by-step.

---

## 🚀 Key Modules & Features

### 1. ⚙️ Norly-Cal (Standard Calculator)
A clean standard calculator for everyday calculations.
*   **Intuitive UI**: Dark-themed buttons with scale-click animations and responsive layout structures.
*   **History Logs**: Left-side drawer displaying recent calculations. Clicking on any record loads it back into the display.
*   **Flagged Calculations**: Right-side drawer allowing users to bookmark and save specific formulas or answers for quick access.
*   **Keyboard Support**: Fully mapped physical keyboard listeners.
*   **LocalStorage Persistence**: Recent equations and flagged answers persist across page reloads.

### 2. 🧪 Sciency-Cal (Scientific Calculator)
A robust workspace for advanced math, trigonometry, calculus, and mathematical constants.
*   **Angle Modes**: Toggle between **Radians (Rad)** and **Degrees (Deg)**. Changing modes dynamically recalculates the active expression.
*   **Advanced Mathematics**:
    *   *Trigonometry*: `sin`, `cos`, `tan`
    *   *Inverse Trigonometry*: `sin⁻¹`, `cos⁻¹`, `tan⁻¹`
    *   *Logarithms*: Common log (`log` base 10) and Natural log (`ln`)
    *   *Powers & Roots*: Square root (`√`), square (`x²`), custom exponent (`xʸ`), and reciprocal (`1/x`)
    *   *Combinatorics & Constants*: Factorials (`x!`), Pi (`π`), and Euler's number (`e`).
*   **Keyboard Listeners**: Rich keyboard mapping matching scientific expression entry.
*   **History & Flagging**: Dedicated persistent lists for scientific evaluations.

### 3. 🤖 HelHome-Cal (AI Homework Helper)
An interactive conversational homework solver designed to guide students through math step-by-step.
*   **Dynamic Chat Interface**: Renders a message bubble feed, typing indicators, and step-by-step breakdown blocks.
*   **Mock Attachment Tray**: Simulate uploading **Images**, **Videos**, or **Documents** to scan math homework sheets.
*   **Simulated Voice Dictation**: Hands-free voice recognition simulation typing math questions in real time.
*   **Interactive Solvers**:
    *   *Quadratic Equations*: Solves equations in the form `x^2 - 7x + 12 = 0` showing discriminant (`D`) and real/complex roots.
    *   *Linear Equations*: Isolates and solves single-variable expressions step-by-step (e.g. `solve 4x + 10 = 30`).
    *   *Calculus Solver*: Computes derivatives and integrals using the power rule.
    *   *Geometric Solver*: Computes Pythagorean hypotenuses and circle areas.
*   **Chat History & Flags**: Organize and preserve specific homework sessions in separate threads.

---

## ⌨️ Keyboard Mappings

To make calculations seamless, Cal-EaZy maps your physical keyboard key presses to calculator actions:

| Category | Keyboard Key | Action / Button |
|---|---|---|
| **Common** | `0` - `9` | Digits |
| | `.` | Decimal Point |
| | `+` | Add |
| | `-` | Subtract |
| | `*` or `x` | Multiply (`×`) |
| | `/` | Divide (`÷`) |
| | `%` | Percentage |
| | `(` or `)` | Parentheses |
| | `Backspace` | Delete last character (`DEL`) |
| | `Escape` or `c` | Clear (`C`) |
| | `Enter` or `=` | Calculate (`=`) |
| **Scientific Only** | `^` | Custom Exponent (`xʸ`) |
| | `!` | Factorial (`x!`) |
| | `s` | Sine (`sin`) |
| | `o` | Cosine (`cos`) |
| | `t` | Tangent (`tan`) |
| | `l` | Common Log (`log`) |
| | `n` | Natural Log (`ln`) |
| | `q` | Square Root (`√`) |
| | `p` | Pi constant (`π`) |
| | `e` | Euler's number (`e`) |
| | `r` | Rad / Deg toggle |

---

## 🛠️ Technical Implementation

### Hand-Rolled Math Parser (`parser.js`)
Instead of relying on insecure and basic JavaScript functions like `eval()`, Cal-EaZy features a custom-built mathematical expression parsing engine:
*   **Tokenization**: Lexes mathematical symbols (`×`, `÷`, `π`, `e`, `√`, inverse trigonometry functions) into semantic tokens.
*   **Recursive Descent Parser**: Structured parser that honors standard operator precedence (parentheses first, then postfix, powers, multiplication/division, and addition/subtraction).
*   **Trigonometric Precision**: Built-in degrees-to-radians and radians-to-degrees mapping.
*   **Error Prevention**: Graceful validation handling for invalid brackets, divisions by zero, and invalid math strings.

---

## 📂 Project Architecture

```bash
calculator2.0/
├── index.html          # Portal home page showcasing Cal-EaZy modules
├── norly.html          # Standard Calculator interface
├── sciency.html        # Scientific Calculator interface
├── helhom.html         # AI Homework Assistant chat dashboard
│
├── parser.js           # Lexer & recursive descent expression parser
├── norly.js            # Standard calculator application logic & keymapping
├── sciency.js          # Scientific calculator functionality & modes
├── helhom.js           # AI Assistant chat rendering, solvers, and simulation
├── shared.js           # Shareable code helpers
│
├── style.css           # Central design system containing color tokens & layouts
├── fonts/              # Embedded typography ('Itim', 'KoHo', 'Italianno')
└── icon/               # Navigation, toggle, clock, flag, and media SVGs
```

---

## 🎨 Design Systems & Theme

The project features a tailored, premium aesthetic written in vanilla CSS:
*   **Figma Layouts:** The UI/UX was prototype-designed directly in [Figma](https://www.figma.com/design/As4YjQlWaCFxvBTNfmvtU1/Cal-EaZy?node-id=0-1&t=111YJTLTTenfCl6K-1).
*   **Harmonious Color Palette**: Built on warm cream backgrounds (`#F7F1DE`), rich dark-brown header accents (`#4E220F`), crimson red highlight tones (`#9D4444`), and soft mint buttons (`#E4FDB9`).
*   **Premium Typography**: Uses localized, responsive web fonts (`Itim`, `KoHo`, `Italianno`) designed to scale dynamically depending on browser viewport.
*   **Transitions**: Smooth slide animations on drawer toggles and hover highlights.

---

## ⚙️ Running Locally

1. Clone the repository or download the project files.
2. Open [index.html](file:///c:/my_webdev/calculator2.0/index.html) in any modern web browser.
3. Navigate through the header links to switch between calculators and the homework solver!

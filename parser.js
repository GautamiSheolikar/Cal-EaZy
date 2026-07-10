class MathParser {
    constructor(degMode = false) {
        this.degMode = degMode; // true = degrees, false = radians
    }

    setDegMode(val) {
        this.degMode = val;
    }

    evaluate(expression) {
        // Pre-process expression to clean it up
        let expr = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/√/g, 'sqrt')
            .replace(/sin⁻¹/g, 'asin')
            .replace(/cos⁻¹/g, 'acos')
            .replace(/tan⁻¹/g, 'atan');

        let tokens = this.tokenize(expr);
        let parserState = {
            tokens: tokens,
            index: 0
        };

        let result = this.parseExpression(parserState);
        if (parserState.index < tokens.length) {
            throw new Error("Unexpected token: " + tokens[parserState.index].value);
        }
        return result;
    }

    tokenize(expr) {
        let tokens = [];
        let i = 0;
        while (i < expr.length) {
            let char = expr[i];

            if (/\s/.test(char)) {
                i++;
                continue;
            }

            // Constants/Numbers
            if (/[0-9.]/.test(char)) {
                let numStr = "";
                while (i < expr.length && /[0-9.]/.test(expr[i])) {
                    numStr += expr[i];
                    i++;
                }
                tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
                continue;
            }

            // Word tokens (functions and Math.PI / Math.E)
            if (/[a-zA-Z]/.test(char) || char === '⁻' || char === '¹') {
                let name = "";
                while (i < expr.length && (/[a-zA-Z0-9._]/.test(expr[i]) || expr[i] === '⁻' || expr[i] === '¹')) {
                    name += expr[i];
                    i++;
                }
                if (name === "Math.PI" || name === "PI" || name === "π" || name === "pi") {
                    tokens.push({ type: 'NUMBER', value: Math.PI });
                } else if (name === "Math.E" || name === "E" || name === "e") {
                    tokens.push({ type: 'NUMBER', value: Math.E });
                } else {
                    tokens.push({ type: 'FUNCTION', value: name });
                }
                continue;
            }

            // Exponentiation '^'
            if (char === '^') {
                tokens.push({ type: 'OPERATOR', value: '^' });
                i++;
                continue;
            }

            // Factorial '!'
            if (char === '!') {
                tokens.push({ type: 'POSTFIX', value: '!' });
                i++;
                continue;
            }

            // Percentage '%'
            if (char === '%') {
                tokens.push({ type: 'POSTFIX', value: '%' });
                i++;
                continue;
            }

            // Check single char operators
            if (['+', '-', '*', '/', '(', ')'].includes(char)) {
                tokens.push({ type: 'OPERATOR', value: char });
                i++;
                continue;
            }

            // Unknown character
            throw new Error("Unknown character: " + char);
        }
        return tokens;
    }

    parseExpression(state) {
        return this.parseAdditionSubtraction(state);
    }

    parseAdditionSubtraction(state) {
        let left = this.parseMultiplicationDivision(state);
        while (state.index < state.tokens.length) {
            let token = state.tokens[state.index];
            if (token.type === 'OPERATOR' && (token.value === '+' || token.value === '-')) {
                state.index++;
                let right = this.parseMultiplicationDivision(state);
                if (token.value === '+') {
                    left = left + right;
                } else {
                    left = left - right;
                }
            } else {
                break;
            }
        }
        return left;
    }

    parseMultiplicationDivision(state) {
        let left = this.parsePower(state);
        while (state.index < state.tokens.length) {
            let token = state.tokens[state.index];
            if (token.type === 'OPERATOR' && (token.value === '*' || token.value === '/')) {
                state.index++;
                let right = this.parsePower(state);
                if (token.value === '*') {
                    left = left * right;
                } else {
                    if (right === 0) throw new Error("Division by zero");
                    left = left / right;
                }
            } else if (token.type === 'NUMBER' || token.type === 'FUNCTION' || (token.type === 'OPERATOR' && token.value === '(')) {
                // Implicit multiplication
                let right = this.parsePower(state);
                left = left * right;
            } else {
                break;
            }
        }
        return left;
    }

    parsePower(state) {
        let left = this.parsePostfix(state);
        while (state.index < state.tokens.length) {
            let token = state.tokens[state.index];
            if (token.type === 'OPERATOR' && token.value === '^') {
                state.index++;
                let right = this.parsePower(state); // Right-associative
                left = Math.pow(left, right);
            } else {
                break;
            }
        }
        return left;
    }

    parsePostfix(state) {
        let left = this.parsePrimary(state);
        while (state.index < state.tokens.length) {
            let token = state.tokens[state.index];
            if (token.type === 'POSTFIX') {
                state.index++;
                if (token.value === '!') {
                    left = this.factorial(left);
                } else if (token.value === '%') {
                    left = left * 0.01;
                }
            } else {
                break;
            }
        }
        return left;
    }

    factorial(n) {
        if (n < 0) throw new Error("Factorial of negative number");
        if (n % 1 !== 0) {
            n = Math.round(n);
        }
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    parsePrimary(state) {
        if (state.index >= state.tokens.length) {
            throw new Error("Unexpected end of expression");
        }

        let token = state.tokens[state.index];

        if (token.type === 'OPERATOR' && (token.value === '-' || token.value === '+')) {
            state.index++;
            let val = this.parsePrimary(state);
            return token.value === '-' ? -val : val;
        }

        if (token.type === 'NUMBER') {
            state.index++;
            return token.value;
        }

        if (token.type === 'FUNCTION') {
            let funcName = token.value.toLowerCase();
            state.index++;

            if (state.index >= state.tokens.length || state.tokens[state.index].value !== '(') {
                // If it's a function without brackets, evaluate the immediate next operand
                let arg = this.parsePrimary(state);
                return this.applyFunction(funcName, arg);
            }

            state.index++; // skip '('
            let arg = this.parseExpression(state);

            if (state.index >= state.tokens.length || state.tokens[state.index].value !== ')') {
                throw new Error("Missing closing parenthesis");
            }
            state.index++; // skip ')'
            return this.applyFunction(funcName, arg);
        }

        if (token.type === 'OPERATOR' && token.value === '(') {
            state.index++; // skip '('
            let val = this.parseExpression(state);
            if (state.index >= state.tokens.length || state.tokens[state.index].value !== ')') {
                throw new Error("Missing closing parenthesis");
            }
            state.index++; // skip ')'
            return val;
        }

        throw new Error("Unexpected token: " + token.value);
    }

    applyFunction(name, arg) {
        const toRad = x => x * (Math.PI / 180);
        const toDeg = x => x * (180 / Math.PI);

        switch (name) {
            case 'sin':
                return Math.sin(this.degMode ? toRad(arg) : arg);
            case 'cos':
                return Math.cos(this.degMode ? toRad(arg) : arg);
            case 'tan':
                return Math.tan(this.degMode ? toRad(arg) : arg);
            case 'asin':
            case 'sin⁻¹':
                return this.degMode ? toDeg(Math.asin(arg)) : Math.asin(arg);
            case 'acos':
            case 'cos⁻¹':
                return this.degMode ? toDeg(Math.acos(arg)) : Math.acos(arg);
            case 'atan':
            case 'tan⁻¹':
                return this.degMode ? toDeg(Math.atan(arg)) : Math.atan(arg);
            case 'log':
                return Math.log10(arg);
            case 'ln':
                return Math.log(arg);
            case 'sqrt':
            case '√':
                if (arg < 0) throw new Error("Square root of negative number");
                return Math.sqrt(arg);
            default:
                throw new Error("Unknown function: " + name);
        }
    }
}

// Make it globally accessible
window.MathParser = MathParser;

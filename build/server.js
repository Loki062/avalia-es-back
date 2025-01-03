"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("Welcome to the API!");
});
// Rota de registro
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, cpf, phoneNumber, username, password } = req.body;
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    try {
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                cpf,
                phoneNumber,
                username,
                password: hashedPassword
            }
        });
        res.status(201).json({ message: 'User registered successfully', newUser });
    }
    catch (error) { // Declara error como unknown
        // Verifica se o erro é uma instância de Error
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
        else {
            // Se não for uma instância de Error, retorna uma mensagem genérica
            res.status(500).json({ message: 'Error registering user', error: 'An unexpected error occurred' });
        }
    }
});
// Rota de login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (user && await bcryptjs_1.default.compare(password, user.password)) {
            const secret = process.env.JWT_SECRET;
            if (typeof secret !== 'string') {
                throw new Error('JWT secret is undefined');
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token, userId: user.id });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) { // Declara error como unknown
        // Verifica se o erro é uma instância de Error
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
        else {
            // Se não for uma instância de Error, retorna uma mensagem genérica
            res.status(500).json({ message: 'Error registering user', error: 'An unexpected error occurred' });
        }
    }
});
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

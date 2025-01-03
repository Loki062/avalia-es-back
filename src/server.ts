import dotenv from 'dotenv';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Rota de registro
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, cpf, phoneNumber, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
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
    } catch (error: unknown) {  // Declara error como unknown
      // Verifica se o erro é uma instância de Error
      if (error instanceof Error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
      } else {
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
      if (user && await bcrypt.compare(password, user.password)) {
        const secret = process.env.JWT_SECRET;
        if (typeof secret !== 'string') {
          throw new Error('JWT secret is undefined');
        }
        const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token, userId: user.id });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error: unknown) {  // Declara error como unknown
        // Verifica se o erro é uma instância de Error
        if (error instanceof Error) {
          res.status(500).json({ message: 'Error registering user', error: error.message });
        } else {
          // Se não for uma instância de Error, retorna uma mensagem genérica
          res.status(500).json({ message: 'Error registering user', error: 'An unexpected error occurred' });
        }
      }
    });

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

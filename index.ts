import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import cookie from 'cookie';
import { verifyToken } from './utils/jwt';
import prisma from './config/prisma';
import { setSocketIoInstance } from './controllers/post.controller';
setSocketIoInstance(io);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:9000', // frontend origin
    credentials: true,
  },
});

// Socket auth middleware
io.use(async (socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || '');
  const token = cookies.token;

  if (!token) return next(new Error('Unauthorized'));

  try {
    const payload = verifyToken<{ userId: string; sessionToken: string }>(token);
    const session = await prisma.session.findUnique({ where: { token: payload.sessionToken } });

    if (!session || session.userId !== payload.userId) {
      return next(new Error('Invalid session'));
    }

    // Attach user data to socket
    (socket as any).user = { id: payload.userId };
    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const user = (socket as any).user;
  console.log(`User connected: ${user.id}`);

  socket.join(`user:${user.id}`);

  socket.on('message', (data) => {
    console.log(`Message from ${user.id}:`, data);
    // example: broadcast to all other users
    socket.broadcast.emit('message', { userId: user.id, data });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${user.id}`);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


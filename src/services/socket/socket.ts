import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const socket = io(URL, {
  autoConnect: true,
})

socket.on('connect', () => {
    console.log('[Socket] Connected to server:', socket.id)
})

socket.on('disconnect', () => {
    console.log('[Socket] Disconnected from server')
})

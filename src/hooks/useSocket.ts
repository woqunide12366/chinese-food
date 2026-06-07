import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

// 自动适配当前域名：开发环境走 Vite 代理，生产环境（Docker/任意域名）走同域
const SOCKET_URL = "";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Docker 部署优先使用 WebSocket，失败自动降级到 polling
    });
  }
  return socket;
}

export function useSocket(phone: string | undefined) {
  useEffect(() => {
    if (phone) {
      const s = getSocket();
      s.emit("join", phone);
    }
  }, [phone]);
}

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotificationStatus = "loading" | "success" | "error";

export interface NotificationEvent {
  id: string;
  title: string;
  status: NotificationStatus;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: NotificationEvent[];
  addNotification: (title: string, status: NotificationStatus) => string;
  updateNotification: (id: string, title: string, status: NotificationStatus) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  const addNotification = useCallback((title: string, status: NotificationStatus) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [
      { id, title, status, timestamp: new Date() },
      ...prev,
    ]);
    return id;
  }, []);

  const updateNotification = useCallback((id: string, title: string, status: NotificationStatus) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, title, status, timestamp: new Date() } : notif
      )
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, updateNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotificationStatus = "loading" | "success" | "error";

export interface NotificationEvent {
  id: string;
  title: string;
  status: NotificationStatus;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationEvent[];
  addNotification: (title: string, status: NotificationStatus) => string;
  updateNotification: (id: string, title: string, status: NotificationStatus) => void;
  removeNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("ocr-notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const formatted = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(formatted);
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ocr-notifications", JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  const addNotification = useCallback((title: string, status: NotificationStatus) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [
      { id, title, status, timestamp: new Date(), read: false },
      ...prev,
    ]);
    return id;
  }, []);

  const updateNotification = useCallback((id: string, title: string, status: NotificationStatus) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, title, status, timestamp: new Date(), read: false } : notif
      )
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, updateNotification, removeNotification, markAllAsRead, clearAllNotifications }}>
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

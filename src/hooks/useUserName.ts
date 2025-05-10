import { useState, useEffect } from "react";

// Constant for localStorage key
export const USER_NAME_KEY = "livekit-user-name";

export function useUserName() {
  const [name, setName] = useState("");

  // Load saved user name on component mount
  useEffect(() => {
    // Only execute in browser environment
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem(USER_NAME_KEY);
      if (savedName) {
        setName(savedName);
      }
    }
  }, []);

  // Update name handler, also updates localStorage
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_NAME_KEY, newName);
    }
  };

  return { name, setName, handleNameChange };
}

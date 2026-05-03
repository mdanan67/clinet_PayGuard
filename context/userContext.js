"use client"
import React, {useState, useContext ,createContext } from 'react'

const UserContext = createContext({});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    Id:"",
    Role:"",
    name: "John",
  });

  
  const value = {
    user,
    setUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

export default UserContext;
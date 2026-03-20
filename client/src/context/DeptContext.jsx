import { createContext, useContext, useState, useEffect } from 'react';

const DeptContext = createContext();

export const DeptProvider = ({ children }) => {
  const [selectedDept, setSelectedDept] = useState(localStorage.getItem('user_dept') || '');
  const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'CSBS'];

  const setDept = (dept) => {
    setSelectedDept(dept);
    if (dept) {
      localStorage.setItem('user_dept', dept);
    } else {
      localStorage.removeItem('user_dept');
    }
  };

  return (
    <DeptContext.Provider value={{ selectedDept, setDept, departments }}>
      {children}
    </DeptContext.Provider>
  );
};

export const useDept = () => useContext(DeptContext);

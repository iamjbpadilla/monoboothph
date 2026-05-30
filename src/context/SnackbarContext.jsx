import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Snackbar from '../components/Snackbar.jsx';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [state, setState] = useState({ visible: false, message: '' });
  const timerRef = useRef(null);

  const showSnackbar = useCallback((message, duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ visible: true, message });
    timerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar message={state.message} visible={state.visible} />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

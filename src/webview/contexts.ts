import { createContext, useContext } from 'react';

export const ConstantsContext = createContext<Record<string, any>>({});

export const useConstants = () => useContext(ConstantsContext);

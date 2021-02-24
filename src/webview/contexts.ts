import { createContext, useContext } from 'react';

import { Constants } from './types';

export const defaultConstants: Constants = {
  curBranchName: '',
  commitStyles: { angular: { formatter: '' }, author: { formatter: '' } },
};

export const ConstantsContext = createContext(defaultConstants);

export const useConstants = (): Constants => useContext(ConstantsContext);

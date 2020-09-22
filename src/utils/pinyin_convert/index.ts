import dict from './dict';

const getPinyinFromStr = (str: string): string => {
  const cleanStr = (str || '').trim();

  if (!cleanStr) {
    return '';
  }

  let result = '';
  const strLength = cleanStr.length;
  for (let i = 0; i < strLength; i++) {
    const unicode = cleanStr.charCodeAt(i);
    const char = dict[unicode - 19968] || cleanStr[i];
    result += char;
  }

  return result;
};

export default getPinyinFromStr;

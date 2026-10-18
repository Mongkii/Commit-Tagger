import type { GeneratedCommitMsg } from '../types/common';

export const runBranchConverter = (
  source: string,
  branchName: string
): GeneratedCommitMsg | string | null => {
  const expression = source.trim().replace(/;+$/, '');
  if (!expression) {
    return null;
  }

  const convert = new Function(`return (\n${expression}\n)`)() as (
    branchName: string
  ) => GeneratedCommitMsg | string | null;
  return convert(branchName);
};

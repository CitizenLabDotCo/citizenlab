import { isNilOrError } from './helperUtils';

export const getTagValidation = (tag: string) => {
  if (tag.length < 2) {
    return false;
  } else {
    const splitTag = tag;
    const wordCount = splitTag.split(' ').filter((n) => {
      return n !== '';
    }).length;

    return !isNilOrError(wordCount) && [1, 2].includes(wordCount);
  }
};

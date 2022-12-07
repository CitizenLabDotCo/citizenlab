import { IFlatCustomField } from 'services/formCustomFields';

export const movePageWithQuestions = (
  fields: IFlatCustomField[],
  fromIndex: number,
  toIndex: number
) => {
  let usedFromIndex = fromIndex;
  let usedToIndex = toIndex;

  if (fromIndex < toIndex) {
    usedFromIndex = toIndex;
    usedToIndex = fromIndex;
  }

  // First, find the starting index of the page we want to move
  let pageStartIndex = -1;
  for (let i = 0; i < fields.length; i++) {
    const item = fields[i];
    if (item.type === 'custom_field' && item.input_type === 'page') {
      // We found a page - check if it's the page we want to move
      if (usedFromIndex === 0) {
        pageStartIndex = i;
        break;
      }
      usedFromIndex--;
    }
  }

  // If we didn't find the page, return the original array
  if (pageStartIndex === -1) {
    return fields;
  }

  // Now, find the ending index of the page we want to move
  let pageEndIndex = -1;
  for (let i = pageStartIndex + 1; i < fields.length; i++) {
    const item = fields[i];
    if (item.type === 'custom_field' && item.input_type === 'page') {
      // We found another page, so the previous page must have ended
      pageEndIndex = i - 1;
      break;
    }
  }

  // If we didn't find the end of the page, it must be the last item in the array
  if (pageEndIndex === -1) {
    pageEndIndex = fields.length - 1;
  }

  // Create a new array that contains the items from the original array,
  // except for the page we want to move
  const newArray: IFlatCustomField[] = [];
  for (let i = 0; i < fields.length; i++) {
    if (i < pageStartIndex || i > pageEndIndex) {
      newArray.push(fields[i]);
    }
  }

  // Find the index where we want to insert the page
  let insertIndex = -1;
  for (let i = 0; i < fields.length; i++) {
    const item = fields[i];
    if (item.type === 'custom_field' && item.input_type === 'page') {
      // We found a page - check if it's the page after which we want to insert
      if (usedToIndex === 0) {
        insertIndex = i;
        break;
      }
      usedToIndex--;
    }
  }

  // If we didn't find the insert index, it must be at the end of the array
  if (insertIndex === -1) {
    insertIndex = fields.length;
  }

  // Finally, insert the page we want to move into the new array at the desired index
  for (let i = pageStartIndex; i <= pageEndIndex; i++) {
    newArray.splice(insertIndex, 0, fields[i]);
    insertIndex++;
  }

  return newArray;
};

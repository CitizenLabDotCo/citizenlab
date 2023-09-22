import { IFlatCustomField } from 'services/formCustomFields';

type NumberHash = Record<string, number>;

/* This function is used to calculate the right numbers for each
 * page, section or question.
 * E.g. if you have a page, a question, a question, and a page,
 * you will get page 1, question 1, question 2, page 2.
 * These page numbers are stored by field id, and used throughout
 * the editor to look up the correct page numbers.
 * HOWEVER for some reason we sometimes use the temp_id
 * for fields that are not stored on the server yet. I have no
 * idea why we don't just store their temporary id in the normal
 * id field but anyway we have to deal with this for now.
 * So that's why for fields that also have a temp_id we store the
 * page number both under the normal id and the temp_id.
 */
export const getFieldNumbers = (formCustomFields: IFlatCustomField[]) => {
  let pageNumber = 0;
  let sectionNumber = 0;
  let questionNumber = 0;

  const pageNumbers: NumberHash = {};
  const sectionNumbers: NumberHash = {};
  const questionNumbers: NumberHash = {};

  formCustomFields.forEach(({ id, temp_id, input_type, enabled }) => {
    if (!enabled) return;

    if (input_type === 'page') {
      pageNumber++;

      pageNumbers[id] = pageNumber;
      if (temp_id) pageNumbers[temp_id] = pageNumber;
    } else if (input_type === 'section') {
      sectionNumber++;

      sectionNumbers[id] = sectionNumber;
      if (temp_id) sectionNumbers[temp_id] = sectionNumber;
    } else {
      questionNumber++;

      questionNumbers[id] = questionNumber;
      if (temp_id) questionNumbers[temp_id] = questionNumber;
    }
  });

  return { ...pageNumbers, ...sectionNumbers, ...questionNumbers };
};

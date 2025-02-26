import { ExtendedUISchema, FormValues } from '../typings';

// This returns the elements on a page that are visible based on the data and the Sentiment Linear Scale selection.
const extractElementsByFollowUpLogic = (
  pageElements: ExtendedUISchema[],
  data: FormValues
): ExtendedUISchema[] => {
  // Get a list of any "Follow-up" custom fields in the page.
  const followUpFieldValues = pageElements
    .filter((element) => element.options?.ask_follow_up)
    .map((element) => {
      const parentFieldKey = element.scope.split('/').pop();
      return {
        followUpFieldKey: `${parentFieldKey}_follow_up`,
        parentFieldKey,
      };
    });

  // Filter out any elements that are hidden based on the current form data
  // E.g. If the user has selected a value for a sentiment linear scale field
  // and there is a follow-up question, include the follow-up field in the page.
  return pageElements.filter((element) => {
    const key = element.scope.split('/').pop();

    // Check if the element is a follow-up field.
    const followUpField = followUpFieldValues.find(
      (item) => item.followUpFieldKey === key
    );

    // If the element is NOT a follow-up field, keep it in the page.
    const isNotFollowUpField = !followUpField;

    // If the element IS a follow up field & the parent field DOES NOT have data yet, remove it from the page.
    const noCurrentAnswerToParentQuestion =
      followUpField?.parentFieldKey && !element.scope.includes('follow');

    // If the element IS a follow up field & the parent field DOES have data, keep it in the page.
    const parentFieldHasAnswer =
      followUpField?.parentFieldKey && data[followUpField.parentFieldKey];

    return (
      isNotFollowUpField ||
      parentFieldHasAnswer ||
      noCurrentAnswerToParentQuestion
    );
  });
};

export default extractElementsByFollowUpLogic;

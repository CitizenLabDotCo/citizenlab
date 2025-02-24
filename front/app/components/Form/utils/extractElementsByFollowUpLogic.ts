import { ExtendedUISchema, FormValues } from '../typings';

// This returns the elements on a page that are visible based on the data and the Sentiment Linear Scale selection.
// You can pass returnHidden as true to get the hidden elements
const extractElementsByFollowUpLogic = (
  pageElements: any,
  data: FormValues
): ExtendedUISchema[] => {
  // Get a list of any "Follow-up" custom fields in the page.
  const followUpFieldValues = pageElements
    ?.filter((element) => element.options?.ask_follow_up)
    .map((element) => {
      const parentFieldKey = element.scope?.split('/').pop();
      return {
        followUpFieldKey: `${parentFieldKey}_follow_up`,
        parentFieldKey,
      };
    });

  // Filter out any elements that are hidden based on the current form data
  // E.g. If the user has selected a value for a sentiment linear scale field
  // and there is a follow-up question, include the follow-up field in the page.
  return pageElements?.filter((element) => {
    const key = element.scope?.split('/').pop();
    const followUpField = followUpFieldValues.find(
      (item) => item.followUpFieldKey === key
    );

    return (
      !followUpField ||
      data[followUpField.parentFieldKey] ||
      (data[followUpField.parentFieldKey] &&
        !element.scope?.includes('follow_up'))
    );
  });
};

export default extractElementsByFollowUpLogic;

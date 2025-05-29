import { ParticipationMethod } from 'api/phases/types';

// There are broadly three variants of pages (based on their behavior):
// 1. The page that comes after the submission, e.g. the "success" page
// 2. The page where you have the submit button
// 3. Any other page
// Page variant 1 is significantly different from the other two.
// Page variant 2 is exactly the same as 3, with the only different being
// a different button ("Submit" instead of "Next").
// The last page is always the 'after submission' page,
// and the page before that is always the 'submission' page.
const getPageVariant = (
  currentStep: number,
  numberOfPages: number,
  participationMethod?: ParticipationMethod
) => {
  if (
    currentStep === numberOfPages - 2 ||
    participationMethod === 'common_ground'
  ) {
    return 'submission';
  }

  if (currentStep === numberOfPages - 1) {
    return 'after-submission';
  }

  return 'other';
};

export default getPageVariant;

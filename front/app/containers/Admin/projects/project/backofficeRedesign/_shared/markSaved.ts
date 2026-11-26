import { FieldValues, UseFormReturn } from 'react-hook-form';

// Makes `sent` the saved values of a form that stays open after a save. An
// edit made while the save ran wasn't sent, so it stays unsaved.
const markSaved = <T extends FieldValues>(
  { getValues, reset }: UseFormReturn<T>,
  sent: T
) => {
  const current = getValues();
  reset(sent);
  reset(current, { keepDefaultValues: true });
};

export default markSaved;

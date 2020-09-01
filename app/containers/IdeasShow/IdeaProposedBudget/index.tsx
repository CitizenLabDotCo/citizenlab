import React from 'react';
import Budget from './Budget';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import useTenant from 'hooks/useTenant';

interface Props {
  proposedBudget: number;
}

const IdeaProposedBudget = ({ proposedBudget }: Props) => {
  const locale = useLocale();
  const tenant = useTenant();

  if (!isNilOrError(locale) && !isNilOrError(tenant)) {
    return (
      <Budget proposedBudget={proposedBudget} locale={locale} tenant={tenant} />
    );
  }

  return null;
};

export default IdeaProposedBudget;

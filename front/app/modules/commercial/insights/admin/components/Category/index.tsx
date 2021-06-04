import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

import useCategory from 'modules/commercial/insights/hooks/useInsightsCategory';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import { deleteInsightsInputCategory } from 'modules/commercial/insights/services/insightsInputs';
import messages from 'modules/commercial/insights/admin/containers/Insights/messages';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

import { withRouter, WithRouterProps } from 'react-router';

export type CategoryProps = {
  id: string;
  inputId: string;
} & WithRouterProps &
  InjectedIntlProps;

const Category = ({
  id,
  inputId,
  params: { viewId },
  intl: { formatMessage },
}: CategoryProps) => {
  const category = useCategory(viewId, id);

  if (isNilOrError(category)) {
    return null;
  }
  const handleRemoveCategory = () => {
    const deleteMessage = formatMessage(
      messages.inputsTableDeleteCategoryConfirmation
    );
    if (window.confirm(deleteMessage)) {
      deleteInsightsInputCategory(viewId, inputId, id);
    }
  };

  return (
    <Tag
      status="approved"
      label={category.attributes.name}
      onIconClick={handleRemoveCategory}
    />
  );
};

export default withRouter(injectIntl(Category));

import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IInsightsInputData,
  deleteInsightsInputCategory,
} from 'modules/commercial/insights/services/insightsInputs';

// hooks
import useIdea from 'hooks/useIdea';

// styles
import styled from 'styled-components';

// components
import { Checkbox } from 'cl2-component-library';
import T from 'components/T';
import Tag from 'modules/commercial/insights/admin/components/Tag';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

const TagList = styled.div`
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

type InputsTableRow = {
  input: IInsightsInputData;
} & WithRouterProps &
  InjectedIntlProps;

const InputsTableRow = ({
  input,
  params: { viewId },
  intl: { formatMessage },
}: InputsTableRow) => {
  const idea = useIdea({ ideaId: input.relationships?.source.data.id });

  if (isNilOrError(idea)) {
    return null;
  }

  const handleRemoveCategory = (categoryId: string) => () => {
    const deleteMessage = formatMessage(
      messages.inputsTableDeleteCategoryConfirmation
    );
    if (window.confirm(deleteMessage)) {
      deleteInsightsInputCategory(viewId, input.id, categoryId);
    }
  };

  return (
    <tr tabIndex={0} data-testid="insightsInputsTableRow">
      <td>
        <Checkbox checked={false} onChange={() => {}} />
      </td>
      <td>
        <T value={idea.attributes.title_multiloc} />
      </td>
      <td>
        <TagList>
          {input.relationships?.categories.data.map((category) => (
            <Tag
              id={category.id}
              label={category.id}
              key={category.id}
              status="approved"
              onIconClick={handleRemoveCategory(category.id)}
            />
          ))}
        </TagList>
      </td>
    </tr>
  );
};

export default injectIntl(withRouter(InputsTableRow));

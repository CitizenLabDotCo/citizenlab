import React, { useState, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IInsightsInputData,
  deleteInsightsInputCategory,
} from 'modules/commercial/insights/services/insightsInputs';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// components
import Tag from 'modules/commercial/insights/admin/components/Tag';
import Idea from './Idea';

// hooks
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';

// styles
import styled from 'styled-components';
// import { colors, fontSizes } from 'utils/styleUtils';

type InputDetailsProps = {
  initiallySelectedInput: IInsightsInputData;
} & WithRouterProps &
  InjectedIntlProps;

const Container = styled.div`
  padding: 48px;
`;

const TagList = styled.div`
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

const InputDetails = ({
  initiallySelectedInput,
  intl: { formatMessage },
  params: { viewId },
}: InputDetailsProps) => {
  const [selectedInput, setSelectedInput] = useState(initiallySelectedInput);

  const inputs = useInsightsInputs(viewId);

  useEffect(() => {
    if (!isNilOrError(inputs)) {
      const selectedInput = inputs.find(
        (input) => input.id === initiallySelectedInput.id
      );
      selectedInput && setSelectedInput(selectedInput);
    }
  }, [isNilOrError, inputs, initiallySelectedInput]);

  if (isNilOrError(inputs)) {
    return null;
  }

  const ideaId = selectedInput.relationships?.source.data.id;

  const handleRemoveCategory = (categoryId: string) => () => {
    const deleteMessage = formatMessage(
      messages.inputsTableDeleteCategoryConfirmation
    );
    if (window.confirm(deleteMessage)) {
      deleteInsightsInputCategory(viewId, selectedInput.id, categoryId);
    }
  };

  return (
    <Container>
      <TagList>
        {selectedInput.relationships?.categories.data.map((category) => (
          <Tag
            id={category.id}
            label={category.id}
            key={category.id}
            status="approved"
            onIconClick={handleRemoveCategory(category.id)}
          />
        ))}
      </TagList>
      {ideaId && <Idea ideaId={ideaId} />}
    </Container>
  );
};

export default withRouter(injectIntl(InputDetails));

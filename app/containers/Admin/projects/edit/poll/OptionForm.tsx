import React, { useState } from 'react';

import { IPollQuestion } from 'services/pollQuestions';

import T from 'components/T';

import Button from 'components/UI/Button';
import { Icon } from 'semantic-ui-react';
import { Row, TextCell } from 'components/admin/ResourceList';
import FormOptionRow from './FormOptionRow';

import { Locale } from 'typings';

import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`

`;
const OptionsContainer = styled.div`
  margin-left: 65px;
`;

const DisabledDragHandle = styled.div`
  color: ${colors.label};
  padding: 1rem;
`;

const StyledTextCell = styled(TextCell)`
`;

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const OptionForm = ({ question, collapse, locale }: {
  question: IPollQuestion,
  collapse: () => void,
  locale: Locale
}) => {
  const [editing, setEditing] = useState<string | null>('new');
  return (
    <Container
      key={question.id}
      id={question.id}
      className="e2e-options-form"
    >
      <Row>
        <DisabledDragHandle>
          <Icon name="sort" />
        </DisabledDragHandle>
        <StyledTextCell className="expand">
          <FormattedMessage {...messages.optionsFormHeader} values={{ questionTitle: <T value={question.attributes.title_multiloc} /> }} />
        </StyledTextCell>
        <Button
          className="e2e-delete-question"
          onClick={collapse}
          style="secondary"
          icon="close"
        >
          done
        </Button>
      </Row>
      <OptionsContainer>

      {editing === 'new' ? (
        <FormOptionRow
          locale={locale}
          mode="new"
        />
      ) : (
          <Button
            className="e2e-add-option"
            style="secondary"
            icon="create"
          >
            addOption
          </Button>
        )}
        </OptionsContainer>
    </Container>
  );
};

export default OptionForm;

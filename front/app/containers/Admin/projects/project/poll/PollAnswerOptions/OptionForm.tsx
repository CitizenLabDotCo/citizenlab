// Libraries
import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// Services / Data loading
import { IPollQuestionData } from 'api/poll_questions/types';
import { IPollOptionData } from 'api/poll_options/types';

// Components
import T from 'components/T';
import Button from 'components/UI/Button';
import { Icon } from 'semantic-ui-react';
import { Row, TextCell, List } from 'components/admin/ResourceList';
import OptionFormRow from './OptionFormRow';
import OptionRow from './OptionRow';
import QuestionDetailsFormRow from '../PollQuestions/QuestionDetailsFormRow';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Style
import styled from 'styled-components';
import { colors, Text } from '@citizenlab/cl2-component-library';
import usePollOptions from 'api/poll_options/usePollOptions';
import useDeletePollOption from 'api/poll_options/useDeletePollOption';

const Container = styled.div``;

const OptionsContainer = styled.div`
  margin-left: 67px;
`;

const StyledButton = styled(Button)`
  margin-bottom: 20px;
`;

const DisabledDragHandle = styled.div`
  color: ${colors.coolGrey600};
  padding: 1rem;
`;

interface Props {
  question: IPollQuestionData;
  collapse: () => void;
}

const OptionForm = ({ question, collapse }: Props) => {
  const { data: pollOptions } = usePollOptions(question.id);
  const { mutate: deletePollOption } = useDeletePollOption();
  const [editingId, setEditingId] = useState<string | null>(null);

  const closeRow = () => {
    setEditingId(null);
  };

  const editOption = (optionId: string) => () => {
    setEditingId(optionId);
  };

  const addOption = () => {
    setEditingId('new');
  };

  const deleteOption = (optionId: string) => () => {
    deletePollOption({ optionId, questionId: question.id });
  };

  return (
    <Container key={question.id} id={question.id} className="e2e-options-form">
      <Row>
        <DisabledDragHandle>
          <Icon name="sort" />
        </DisabledDragHandle>
        <TextCell className="expand">
          <b>
            <FormattedMessage
              {...messages.optionsFormHeader}
              values={{
                questionTitle: (
                  <Text display="inline" fontWeight="normal">
                    <T value={question.attributes.title_multiloc} />
                  </Text>
                ),
              }}
            />
          </b>
        </TextCell>
      </Row>
      <OptionsContainer>
        <List
          key={
            isNilOrError(pollOptions)
              ? 0
              : pollOptions.data.length + (editingId === 'new' ? 1 : 0)
          }
        >
          {!isNilOrError(pollOptions) && (
            <>
              <QuestionDetailsFormRow
                question={question}
                onCancelOptionEditing={collapse}
              />
              {pollOptions.data.map((pollOption: IPollOptionData) =>
                editingId === pollOption.id ? (
                  <OptionFormRow
                    questionId={question.id}
                    key={pollOption.id}
                    mode="edit"
                    closeRow={closeRow}
                    optionId={pollOption.id}
                    titleMultiloc={pollOption.attributes.title_multiloc}
                  />
                ) : (
                  <OptionRow
                    key={pollOption.id}
                    pollOptionId={pollOption.id}
                    pollOptionTitle={pollOption.attributes.title_multiloc}
                    deleteOption={deleteOption(pollOption.id)}
                    editOption={editOption(pollOption.id)}
                  />
                )
              )}
            </>
          )}
          {editingId === 'new' ? (
            <OptionFormRow
              key="new"
              mode="new"
              questionId={question.id}
              closeRow={closeRow}
            />
          ) : (
            <StyledButton
              className="e2e-add-option"
              buttonStyle="admin-dark"
              icon="plus-circle"
              onClick={addOption}
              autoFocus
            >
              <FormattedMessage {...messages.addAnswerOption} />
            </StyledButton>
          )}
        </List>
      </OptionsContainer>
    </Container>
  );
};

export default OptionForm;

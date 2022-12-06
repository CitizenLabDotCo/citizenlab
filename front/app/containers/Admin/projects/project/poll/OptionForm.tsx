// Libraries
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Icon } from 'semantic-ui-react';
// Style
import styled from 'styled-components';
// Services / Data loading
import GetPollOptions, {
  GetPollOptionsChildProps,
} from 'resources/GetPollOptions';
import { IPollOption, deletePollOption } from 'services/pollOptions';
import { IPollQuestion } from 'services/pollQuestions';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
// Components
import T from 'components/T';
import Button from 'components/UI/Button';
import { Row, TextCell, List } from 'components/admin/ResourceList';
import FormOptionRow from './FormOptionRow';
import OptionRow from './OptionRow';
import QuestionDetailsForm from './QuestionDetailsForm';
import messages from './messages';

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

interface InputProps {
  question: IPollQuestion;
  collapse: () => void;
}

interface DataProps {
  pollOptions: GetPollOptionsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  editingId: string | null;
}

export class OptionForm extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      editingId: null,
    };
  }

  closeRow = () => {
    this.setState({ editingId: null });
  };

  editOption = (optionId: string) => () => {
    this.setState({ editingId: optionId });
  };

  addOption = () => {
    this.setState({ editingId: 'new' });
  };

  deleteOption = (optionId: string) => () => {
    deletePollOption(optionId);
  };

  render() {
    const { question, collapse, pollOptions } = this.props;
    const { editingId } = this.state;
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
          <TextCell className="expand">
            <FormattedMessage
              {...messages.optionsFormHeader}
              values={{
                questionTitle: <T value={question.attributes.title_multiloc} />,
              }}
            />
          </TextCell>
          <Button
            className="e2e-collapse-option-form"
            onClick={collapse}
            buttonStyle="secondary"
          >
            <FormattedMessage {...messages.editOptionSave} />
          </Button>
        </Row>
        <OptionsContainer>
          <List
            key={
              isNilOrError(pollOptions)
                ? 0
                : pollOptions.length + (editingId === 'new' ? 1 : 0)
            }
          >
            {!isNilOrError(pollOptions) && (
              <>
                <QuestionDetailsForm question={question} />
                {pollOptions.map((pollOption: IPollOption) =>
                  editingId === pollOption.id ? (
                    <FormOptionRow
                      key={pollOption.id}
                      mode="edit"
                      closeRow={this.closeRow}
                      optionId={pollOption.id}
                      titleMultiloc={pollOption.attributes.title_multiloc}
                    />
                  ) : (
                    <OptionRow
                      key={pollOption.id}
                      pollOptionId={pollOption.id}
                      pollOptionTitle={pollOption.attributes.title_multiloc}
                      deleteOption={this.deleteOption(pollOption.id)}
                      editOption={this.editOption(pollOption.id)}
                    />
                  )
                )}
              </>
            )}
            {editingId === 'new' ? (
              <FormOptionRow
                key="new"
                mode="new"
                questionId={question.id}
                closeRow={this.closeRow}
              />
            ) : (
              <StyledButton
                className="e2e-add-option"
                buttonStyle="secondary"
                icon="plus-circle"
                iconColor={colors.primary}
                onClick={this.addOption}
                autoFocus
              >
                <FormattedMessage {...messages.addAnswerChoice} />
              </StyledButton>
            )}
          </List>
        </OptionsContainer>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  pollOptions: ({ question, render }) => (
    <GetPollOptions questionId={question.id}>{render}</GetPollOptions>
  ),
});

const OptionFormWithData = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <OptionForm {...inputProps} {...dataProps} />}
  </Data>
);

export default OptionFormWithData;

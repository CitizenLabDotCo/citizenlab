import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import StatusChangeForm from './StatusChangeForm';

// resources
import { isNilOrError } from 'utils/helperUtils';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeStatus, { GetInitiativeStatusChildProps } from 'resources/GetInitiativeStatus';
import GetOfficialFeedbacks, { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';
import OfficialFeedbackForm from 'components/PostComponents/OfficialFeedback/Form/OfficialFeedbackForm';

// services
import { updateInitiativeStatusWithExistingFeedback, updateInitiativeStatusAddFeedback } from 'services/initiativeStatusChanges';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import T from 'components/T';

// Typings
import { Multiloc, MultilocFormValues } from 'typings';

const Container = styled.div`
  background: ${colors.background};
  padding: 25px;
`;
const ContextLine = styled.div`
  margin-bottom: 25px;
  font-size: ${fontSizes.base}px;
`;
const ColoredText = styled.span<{ color: string }>`
  color: ${({ color }) => color};
`;

interface InputProps {
  initiativeId: string;
  newStatusId: string;
  closeModal: () => void;
}

interface DataProps {
  initiative: GetInitiativeChildProps;
  newStatus: GetInitiativeStatusChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
}

interface Props extends DataProps, InputProps { }

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface State {
  mode: 'latest' | 'new';
  newOfficialFeedback: FormValues;
  loading: boolean;
  touched: boolean;
  error: boolean;
}

class StatusChangeFormWrapper extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      mode: 'new',
      newOfficialFeedback: {
        author_multiloc: {},
        body_multiloc: {}
      },
      loading: false,
      touched: false,
      error: false
    };
  }

  onChangeMode = (event) => {
    this.setState({ mode: event });
  }
  onChangeBody = (value) => {
    this.setState((state) => ({ newOfficialFeedback: { ...state.newOfficialFeedback, body_multiloc: value }, touched: true }));
  }
  onChangeAuthor = (value) => {
    this.setState((state) => ({ newOfficialFeedback: { ...state.newOfficialFeedback, author_multiloc: value }, touched: true }));
  }

  validate = () => {
    const { mode, newOfficialFeedback, touched } = this.state;
    if (mode === 'new') {
      const validation = OfficialFeedbackForm.validate(newOfficialFeedback);
      return Object.keys(validation).length === 0 && touched;
    } else {
      return true;
    }
  }

  submit = () => {
    const { initiativeId, newStatusId, closeModal, officialFeedbacks } = this.props;
    const { mode, newOfficialFeedback: { body_multiloc, author_multiloc } } = this.state;
    if (this.validate()) {
      if (mode === 'new') {
        this.setState({ loading: true });
        updateInitiativeStatusAddFeedback(initiativeId, newStatusId, body_multiloc, author_multiloc)
          .then(() => closeModal())
          .catch(() => {
            this.setState({ loading: false, error: true });
          });
      } else if (mode === 'latest' && !isNilOrError(officialFeedbacks.officialFeedbacksList)) {
        updateInitiativeStatusWithExistingFeedback(initiativeId, newStatusId, officialFeedbacks.officialFeedbacksList.data[0].id)
          .then(() => closeModal())
          .catch(() => {
            this.setState({ loading: false, error: true });
          });
      }
    }
  }

  render() {
    const { initiative, newStatus, officialFeedbacks } = this.props;
    const { loading, error, newOfficialFeedback, mode } = this.state;

    if (isNilOrError(initiative) || isNilOrError(newStatus) || officialFeedbacks.officialFeedbacksList === undefined) return null;

    return (
      <Container>
        <ContextLine>
          <FormattedMessage
            {...messages.statusChange}
            values={{
              initiativeTitle: (
                <ColoredText color={colors.clBlueDark}>
                  <T value={initiative.attributes.title_multiloc} />
                </ColoredText>
              ),
              newStatus: (
                <ColoredText color={newStatus.attributes.color}>
                  <T value={newStatus.attributes.title_multiloc} />
                </ColoredText>
              )
            }}
          />
        </ContextLine>
        <StatusChangeForm
          {...{
            loading,
            error,
            newOfficialFeedback,
            mode,
          }}
          valid={this.validate()}
          onChangeAuthor={this.onChangeAuthor}
          onChangeBody={this.onChangeBody}
          onChangeMode={this.onChangeMode}
          latestOfficialFeedback={get(officialFeedbacks, 'officialFeedbacksList.data[0]', null)}
          submit={this.submit}
        />
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  newStatus: ({ newStatusId, render }) => <GetInitiativeStatus id={newStatusId}>{render}</GetInitiativeStatus>,
  officialFeedbacks: ({ initiativeId, render }) => <GetOfficialFeedbacks postId={initiativeId} postType="initiative">{render}</GetOfficialFeedbacks>
});

const StatusChangeFormWrapperWithHocs = injectIntl(StatusChangeFormWrapper);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <StatusChangeFormWrapperWithHocs {...inputProps} {...dataProps} />}
  </Data>
);

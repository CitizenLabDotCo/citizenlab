import React, { PureComponent, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { isObject } from 'lodash-es';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Spinner } from 'cl2-component-library';
import UserCustomFieldsForm from 'modules/user_custom_fields/citizen/components/UserCustomFieldsForm';

// services
import { completeRegistration } from 'services/users';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetUserCustomFieldsSchema, {
  GetUserCustomFieldsSchemaChildProps,
} from 'modules/user_custom_fields/resources/GetUserCustomFieldsSchema';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../../../components/SignUpIn/SignUp/messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { colors, fontSizes, media } from 'utils/styleUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// typings
import { CLErrorsJSON } from 'typings';

const Loading = styled.div`
  padding-top: 15px;
`;

const Container = styled.div`
  padding-bottom: 30px;

  ${media.smallerThanMinTablet`
    padding-bottom: 15px;
  `}
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -15px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  `}
`;

const SkipButton = styled.button`
  color: ${colors.clGreyOnGreyBackground};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
  margin-left: 15px;

  &:hover {
    color: #000;
    text-decoration: underline;
  }

  ${media.smallerThanMinTablet`
    margin-left: 0px;
    margin-top: 30px;
    text-align: center;
  `}
`;

type InputProps = {
  onCompleted: () => void;
};

interface DataProps {
  authUser: GetAuthUserChildProps;
  userCustomFieldsSchema: GetUserCustomFieldsSchemaChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {
  processing: boolean;
  unknownError: string | null;
  apiErrors: CLErrorsJSON | null;
};

class CustomFieldsStep extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      processing: false,
      unknownError: null,
      apiErrors: null,
    };
  }

  componentDidMount() {
    trackEventByName(tracks.signUpCustomFieldsStepEntered);
  }

  componentWillMount() {
    trackEventByName(tracks.signUpCustomFieldsStepExited);
  }

  handleOnSubmitButtonClick = (event: FormEvent) => {
    event.preventDefault();
    eventEmitter.emit('customFieldsSubmitEvent');
  };

  handleCustomFieldsFormOnSubmit = async (formData) => {
    const { formatMessage } = this.props.intl;
    const { authUser } = this.props;

    if (authUser && isObject(formData)) {
      try {
        this.setState({
          processing: true,
          unknownError: null,
        });

        await completeRegistration(formData);

        this.setState({ processing: false });
        trackEventByName(tracks.signUpCustomFieldsStepCompleted);
        this.props.onCompleted();
      } catch (error) {
        trackEventByName(tracks.signUpCustomFieldsStepFailed, { error });
        this.setState({
          processing: false,
          unknownError: formatMessage(messages.unknownError),
        });
      }
    }
  };

  skipStep = async (event: FormEvent) => {
    event.preventDefault();

    const { authUser } = this.props;

    trackEventByName(tracks.signUpCustomFieldsStepSkipped);

    if (!isNilOrError(authUser)) {
      await completeRegistration({});
    }

    this.props.onCompleted();
  };

  render() {
    const { step } = this.props;
    if (step !== 'custom-fields') {
      return null;
    }

    const { formatMessage } = this.props.intl;
    const { processing, unknownError } = this.state;
    const { authUser, userCustomFieldsSchema } = this.props;

    if (isNilOrError(authUser) || isNilOrError(userCustomFieldsSchema)) {
      return (
        <Loading>
          <Spinner />
        </Loading>
      );
    }

    if (!isNilOrError(authUser) && !isNilOrError(userCustomFieldsSchema)) {
      return (
        <Container id="e2e-signup-custom-fields-container">
          <UserCustomFieldsForm
            formData={authUser.attributes.custom_field_values}
            onSubmit={this.handleCustomFieldsFormOnSubmit}
          />

          <ButtonWrapper>
            <Button
              id="e2e-signup-custom-fields-submit-btn"
              processing={processing}
              text={formatMessage(messages.completeSignUp)}
              onClick={this.handleOnSubmitButtonClick}
            />
            {!userCustomFieldsSchema.hasRequiredFields && (
              <SkipButton
                className="e2e-signup-custom-fields-skip-btn"
                onClick={this.skipStep}
              >
                {formatMessage(messages.skip)}
              </SkipButton>
            )}
          </ButtonWrapper>
          <Error text={unknownError} />
        </Container>
      );
    }

    return null;
  }
}

const CustomFieldsWithHoC = injectIntl<Props>(CustomFieldsStep);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  userCustomFieldsSchema: <GetUserCustomFieldsSchema />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <CustomFieldsWithHoC {...inputProps} {...dataprops} />}
  </Data>
);

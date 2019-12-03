import React, { PureComponent, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { isEmpty } from 'lodash-es';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Spinner from 'components/UI/Spinner';
import CustomFieldsForm from 'components/Loadable/CustomFieldsForm';

// services
import { completeRegistration } from 'services/users';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetCustomFieldsSchema, { GetCustomFieldsSchemaChildProps } from 'resources/GetCustomFieldsSchema';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { colors, fontSizes, media } from 'utils/styleUtils';

// style
import styled from 'styled-components';

// typings
import { CLErrorsJSON } from 'typings';

const Loading = styled.div`
  padding-top: 15px;
`;

const Container = styled.div`
  margin-bottom: 170px;
`;

const FormElement = styled.div`
  margin-bottom: 20px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

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
  customFieldsSchema: GetCustomFieldsSchemaChildProps;
}

interface Props extends InputProps, DataProps { }

type State = {
  processing: boolean;
  unknownError: string | null;
  apiErrors: CLErrorsJSON | null;
};

class Step2 extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      processing: false,
      unknownError: null,
      apiErrors: null
    };
  }

  handleOnSubmitButtonClick = (event: FormEvent) => {
    event.preventDefault();
    eventEmitter.emit('SignUpStep2', 'customFieldsSubmitEvent', null);
  }

  handleCustomFieldsFormOnSubmit = async (formData) => {
    const { formatMessage } = this.props.intl;
    const { authUser } = this.props;

    if (authUser) {
      try {
        this.setState({
          processing: true,
          unknownError: null
        });

        if (formData && !isEmpty(formData)) {
          await completeRegistration(formData);
        }

        this.setState({ processing: false });
        this.props.onCompleted();
      } catch (error) {
        this.setState({
          processing: false,
          unknownError: formatMessage(messages.unknownError)
        });
      }
    }
  }

  skipStep = async (event: FormEvent) => {
    event.preventDefault();
    await completeRegistration({});
    this.props.onCompleted();
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { processing, unknownError } = this.state;
    const { authUser, customFieldsSchema } = this.props;

    if (authUser === undefined || customFieldsSchema === undefined) {
      return (
        <Loading id="ideas-loading">
          <Spinner />
        </Loading>
      );
    } else if (!isNilOrError(authUser) && !isNilOrError(customFieldsSchema)) {
      return (
        <Container id="e2e-signup-step2">
          <CustomFieldsForm
            id="e2e-custom-signup-form"
            formData={authUser.attributes.custom_field_values}
            onSubmit={this.handleCustomFieldsFormOnSubmit}
          />

          <FormElement>
            <ButtonWrapper>
              <Button
                id="e2e-signup-step2-button"
                size="1"
                processing={processing}
                text={formatMessage(messages.submit)}
                onClick={this.handleOnSubmitButtonClick}
              />
              {!customFieldsSchema.hasRequiredFields &&
                <SkipButton
                  className="e2e-signup-step2-skip-btn"
                  onClick={this.skipStep}
                >
                  {formatMessage(messages.skip)}
                </SkipButton>
              }
            </ButtonWrapper>
            <Error text={unknownError} />
          </FormElement>
        </Container>
      );
    }

    return null;
  }
}

const Step2WithHocs = injectIntl<Props>(Step2);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  customFieldsSchema: <GetCustomFieldsSchema />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <Step2WithHocs {...inputProps} {...dataprops} />}
  </Data>
);

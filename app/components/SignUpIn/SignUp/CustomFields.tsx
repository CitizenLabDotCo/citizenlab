import React, { PureComponent, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { isObject } from 'lodash-es';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Spinner from 'components/UI/Spinner';
import CustomFieldsForm from 'components/CustomFieldsForm';

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

const Container = styled.div``;

const FormElement = styled.div`
  margin-bottom: 20px;
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

class CustomFields extends PureComponent<Props & InjectedIntlProps, State> {
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
    eventEmitter.emit('customFieldsSubmitEvent');
  }

  handleCustomFieldsFormOnSubmit = async (formData) => {
    const { formatMessage } = this.props.intl;
    const { authUser } = this.props;

    if (authUser && isObject(formData)) {
      try {
        this.setState({
          processing: true,
          unknownError: null
        });

        await completeRegistration(formData, { data: authUser });

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

    const { authUser } = this.props;

    if (!isNilOrError(authUser)) {
      await completeRegistration({}, { data: authUser });
    }

    this.props.onCompleted();
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { processing, unknownError } = this.state;
    const { authUser, customFieldsSchema } = this.props;

    if (isNilOrError(authUser) || isNilOrError(customFieldsSchema)) {
      return (
        <Loading>
          <Spinner />
        </Loading>
      );
    }

    if (!isNilOrError(authUser) && !isNilOrError(customFieldsSchema)) {
      return (
        <Container id="e2e-signup-step3">
          <CustomFieldsForm
            id="e2e-custom-signup-form"
            formData={authUser.attributes.custom_field_values}
            onSubmit={this.handleCustomFieldsFormOnSubmit}
          />

          <FormElement>
            <ButtonWrapper>
              <Button
                id="e2e-signup-step3-button"
                processing={processing}
                text={formatMessage(messages.completeSignUp)}
                onClick={this.handleOnSubmitButtonClick}
              />
              {!customFieldsSchema.hasRequiredFields &&
                <SkipButton
                  className="e2e-signup-step3-skip-btn"
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

const CustomFieldsWithHoC = injectIntl<Props>(CustomFields);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  customFieldsSchema: <GetCustomFieldsSchema />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <CustomFieldsWithHoC {...inputProps} {...dataprops} />}
  </Data>
);

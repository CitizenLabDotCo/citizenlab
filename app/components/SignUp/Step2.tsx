import React, { PureComponent, FormEvent } from 'react';
import { isEmpty, get } from 'lodash-es';
import { Subscription, combineLatest } from 'rxjs';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Spinner from 'components/UI/Spinner';
import CustomFieldsForm from 'components/Loadable/CustomFieldsForm';

// services
import { authUserStream } from 'services/auth';
import { IUser, completeRegistration } from 'services/users';
import { localeStream } from 'services/locale';
import { customFieldsSchemaForUsersStream } from 'services/userCustomFields';

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

const SkipButton = styled.div`
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

type Props = {
  onCompleted: () => void;
};

type State = {
  authUser: IUser | null;
  loading: boolean;
  hasRequiredFields: boolean;
  processing: boolean;
  unknownError: string | null;
  apiErrors: CLErrorsJSON | null;
};

class Step2 extends PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[];

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      authUser: null,
      hasRequiredFields: true,
      loading: true,
      processing: false,
      unknownError: null,
      apiErrors: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const customFieldsSchemaForUsersStream$ = customFieldsSchemaForUsersStream().observable;

    this.subscriptions = [
      combineLatest(
        authUser$,
        locale$,
        customFieldsSchemaForUsersStream$
      ).subscribe(([authUser, locale, customFieldsSchemaForUsersStream]) => {
        this.setState({
          authUser,
          hasRequiredFields: !isEmpty(get(customFieldsSchemaForUsersStream, `json_schema_multiloc.${locale}.required`, null)),
          loading: false
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnSubmitButtonClick = (event: FormEvent) => {
    event.preventDefault();
    eventEmitter.emit('SignUpStep2', 'customFieldsSubmitEvent', null);
  }

  handleCustomFieldsFormOnSubmit = async (formData) => {
    const { formatMessage } = this.props.intl;
    const { authUser } = this.state;

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
    const { authUser, hasRequiredFields, loading, processing, unknownError } = this.state;

    if (loading) {
      return (
        <Loading id="ideas-loading">
          <Spinner />
        </Loading>
      );
    }

    if (!loading && authUser) {
      return (
        <Container id="e2e-signup-step2">
          <CustomFieldsForm
            id="e2e-custom-signup-form"
            formData={authUser.data.attributes.custom_field_values}
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
              {!hasRequiredFields &&
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

export default injectIntl<Props>(Step2);

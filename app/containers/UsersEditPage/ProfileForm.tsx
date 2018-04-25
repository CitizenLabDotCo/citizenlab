import * as React from 'react';
import * as Rx from 'rxjs';
import { isEqual, isEmpty, get } from 'lodash';

// services
import { IAreaData } from 'services/areas';
import { updateUser, IUserData/*, IUserUpdate,*/, mapUserToDiff } from 'services/users';
import { ITenantData } from 'services/tenant';
import { localeStream } from 'services/locale';
import { customFieldsSchemaForUsersStream } from 'services/userCustomFields';

// utils
import { Formik } from 'formik';
import eventEmitter from 'utils/eventEmitter';
import { hasCustomFields } from 'utils/customFields';

// components
import { Grid, Segment } from 'semantic-ui-react';
import ContentContainer from 'components/ContentContainer';
import LabelWithTooltip from './LabelWithTooltip';
import Error from 'components/UI/Error';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToFileObservable } from 'utils/imageTools';
import { SectionTitle, SectionSubtitle, SectionField } from 'components/admin/Section';
import CustomFieldsForm from 'components/CustomFieldsForm';
import TextArea from 'components/UI/TextArea';
import Input from 'components/UI/Input';
import Select from 'components/UI/Select';

// i18n
import { appLocalePairs } from 'i18n';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import localize, { injectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';
import { color } from 'utils/styleUtils';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// typings
import { IOption, ImageFile, API } from 'typings';

const StyledContentContainer = styled(ContentContainer)`
  background: ${color('background')};
  padding-top: 25px;
  padding-bottom: 40px;
`;

// Types
interface InputProps {
  user: IUserData;
  areas: IAreaData[];
  tenant: ITenantData;
}

interface State {
  avatar: ImageFile[] | null;
  hasCustomFields: boolean;
  contextRef: any | null;
  localeOptions: IOption[];
  customFieldsFormData: any;
}

type Props = InputProps & InjectedIntlProps & injectedLocalized;

class ProfileForm extends React.PureComponent<Props, State> {
  localeOptions: IOption[] = [];
  user$: Rx.BehaviorSubject<IUserData>;
  subscriptions: Rx.Subscription[];

  constructor(props: InputProps) {
    super(props as any);
    this.state = {
      avatar: null,
      hasCustomFields: false,
      contextRef: null,
      localeOptions: [],
      customFieldsFormData: null
    };
    this.user$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentDidMount() {
    const user$ = this.user$.filter(user => user !== null).distinctUntilChanged((x, y) => isEqual(x, y));
    const locale$ = localeStream().observable;
    const customFieldsSchemaForUsersStream$ = customFieldsSchemaForUsersStream().observable;

    this.user$.next(this.props.user);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        user$,
        locale$,
        customFieldsSchemaForUsersStream$
      ).switchMap(([user, locale, customFieldsSchema]) => {
        const avatarUrl = get(user, 'attributes.avatar.medium', null) as string | null;
        return (avatarUrl ? convertUrlToFileObservable(avatarUrl) : Rx.Observable.of(null)).map(avatar => ({ user, avatar, locale, customFieldsSchema }));
      }).subscribe(({ user, avatar, locale, customFieldsSchema }) => {
        this.setState({
          hasCustomFields: hasCustomFields(customFieldsSchema, locale),
          avatar: (avatar ? [avatar] : null),
          customFieldsFormData: user.attributes.custom_field_values
        });
      })
    ];

    // Create options arrays only once, avoid re-calculating them on each render
    this.setState({
      localeOptions: this.props.tenantLocales.map((locale) => ({
        value: locale,
        label: appLocalePairs[locale],
      }))
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (!isEqual(this.props.user, prevProps.user)) {
      this.user$.next(this.props.user);
    }

    if (!isEqual(this.props.tenantLocales, prevProps.tenantLocales)) {
      this.setState({
        localeOptions: this.props.tenantLocales.map((locale) => ({
          value: locale,
          label: appLocalePairs[locale],
        }))
      });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleFormikSubmit = (values, formikActions) => {
    let newValues = values;
    const { setSubmitting, resetForm, setErrors, setStatus } = formikActions;

    if (this.state.hasCustomFields) {
      newValues = {
        ...values,
        custom_field_values: this.state.customFieldsFormData
      };
    }

    setStatus('');

    updateUser(this.props.user.id, newValues).then(() => {
      resetForm();
      setStatus('success');
    }).catch((errorResponse) => {
      if (errorResponse.json) {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      }
    });
  }

  formikRender = ({ values, errors, setFieldValue, setFieldTouched, setStatus, isSubmitting, submitForm, isValid,  status, touched }) => {
    const { hasCustomFields } = this.state;

    const handleContextRef = (contextRef) => {
      this.setState({ contextRef });
    };

    const getStatus = () => {
      let returnValue: 'enabled' | 'disabled' | 'error' | 'success' = 'enabled';

      if (isSubmitting) {
        returnValue = 'disabled';
      } else if (!isEmpty(touched) && !isValid) {
        returnValue = 'error';
      } else if (isEmpty(touched) && status === 'success') {
        returnValue = 'success';
      }
  
      return returnValue;
    };

    const handleCustomFieldsFormOnChange = (formData) => {
      this.setState({ customFieldsFormData: formData });
      setStatus('enabled');
    };

    const handleCustomFieldsFormOnSubmit = (formData) => {
      this.setState({ customFieldsFormData: formData });
      submitForm();
    };

    const handleOnSubmit = () => {
      if (this.state.hasCustomFields) {
        eventEmitter.emit('ProfileForm', 'customFieldsSubmitEvent', null);
      } else {
        submitForm();
      }
    };

    const createChangeHandler = (fieldName) => value => {
      if (/_multiloc$/.test(fieldName)) {
        setFieldValue(fieldName, { [this.props.locale]: value });
      } else if (value && value.value) {
        setFieldValue(fieldName, value.value);
      } else {
        setFieldValue(fieldName, value);
      }
    };

    const createBlurHandler = (fieldName) => () => {
      setFieldTouched(fieldName, true);
    };

    const handleAvatarOnAdd = (newAvatar: ImageFile) => {
      this.setState(() => ({ avatar: [newAvatar] }));
      setFieldValue('avatar', newAvatar.base64);
      setFieldTouched('avatar');
    };

    const handleAvatarOnUpdate = (updatedAvatar: ImageFile[]) => {
      const avatar = (updatedAvatar && updatedAvatar.length > 0 ? updatedAvatar : null);
      this.setState({ avatar });
      setFieldValue('avatar', updatedAvatar[0].base64);
      setFieldTouched('avatar');
    };

    const handleAvatarOnRemove = async () => {
      this.setState(() => ({ avatar: null }));
      setFieldValue('avatar', null);
      setFieldTouched('avatar');
    };

    return (
      <StyledContentContainer>
        <Grid centered>
          <Grid.Row>
            <Grid.Column computer={12} mobile={16}>
              <div ref={handleContextRef}>
                <Segment padded="very">

                  <form className="e2e-profile-edit-form">
                    <SectionTitle><FormattedMessage {...messages.h1} /></SectionTitle>
                    <SectionSubtitle><FormattedMessage {...messages.h1sub} /></SectionSubtitle>

                    <SectionField>
                      <ImagesDropzone
                        images={this.state.avatar}
                        imagePreviewRatio={1}
                        maxImagePreviewWidth="160px"
                        acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                        maxImageFileSize={5000000}
                        maxNumberOfImages={1}
                        onAdd={handleAvatarOnAdd}
                        onUpdate={handleAvatarOnUpdate}
                        onRemove={handleAvatarOnRemove}
                        imageRadius="50%"
                      />
                      <Error apiErrors={errors.avatar} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="firstName" />
                      <Input
                        type="text"
                        name="first_name"
                        id="firstName"
                        value={values.first_name}
                        onChange={createChangeHandler('first_name')}
                        onBlur={createBlurHandler('first_name')}
                      />
                      <Error apiErrors={errors.first_name} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="lastName" />
                      <Input
                        type="text"
                        name="last_name"
                        id="lastName"
                        value={values.last_name}
                        onChange={createChangeHandler('last_name')}
                        onBlur={createBlurHandler('last_name')}
                      />
                      <Error apiErrors={errors.last_name} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="email" />
                      <Input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={createChangeHandler('email')}
                        onBlur={createBlurHandler('email')}
                      />
                      <Error apiErrors={errors.email} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="bio" />
                      <TextArea
                        name="bio_multiloc"
                        onChange={createChangeHandler('bio_multiloc')}
                        onBlur={createBlurHandler('bio_multiloc')}
                        rows={6}
                        placeholder={this.props.intl.formatMessage({ ...messages.bio_placeholder })}
                        value={values.bio_multiloc ? this.props.localize(values.bio_multiloc) : ''}
                      />
                      <Error apiErrors={errors.bio_multiloc} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="password" />
                      <Input
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={createChangeHandler('password')}
                        onBlur={createBlurHandler('password')}
                      />
                      <Error apiErrors={errors.password} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="language" />
                      <Select
                        onChange={createChangeHandler('locale')}
                        onBlur={createBlurHandler('locale')}
                        value={values.locale}
                        options={this.state.localeOptions}
                      />
                      <Error apiErrors={errors.locale} />
                    </SectionField>
                  </form>

                  {hasCustomFields &&
                    <CustomFieldsForm
                      formData={this.state.customFieldsFormData}
                      onChange={handleCustomFieldsFormOnChange}
                      onSubmit={handleCustomFieldsFormOnSubmit}
                    />
                  }

                  <SubmitWrapper
                    status={getStatus()}
                    style="primary"
                    loading={isSubmitting}
                    onClick={handleOnSubmit}
                    messages={{
                      buttonSave: messages.submit,
                      buttonError: messages.buttonErrorLabel,
                      buttonSuccess: messages.buttonSuccessLabel,
                      messageSuccess: messages.messageSuccess,
                      messageError: messages.messageError,
                    }}
                  />

                </Segment>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </StyledContentContainer>
    );
  }

  render() {
    return (
      <Formik
        initialValues={mapUserToDiff(this.props.user)}
        onSubmit={this.handleFormikSubmit}
        render={this.formikRender as any}
      />
    );
  }
}

export default injectIntl<InputProps>(localize(ProfileForm));

import * as React from 'react';
import * as Rx from 'rxjs';
import * as moment from 'moment';
import { isEqual, isEmpty, get } from 'lodash';

// services
import { IAreaData } from 'services/areas';
import { updateUser, IUserData, IUserUpdate, mapUserToDiff } from 'services/users';
import { ITenantData } from 'services/tenant';
import { localeStream } from 'services/locale';
import { customFieldsSchemaForUsersStream } from 'services/userCustomFields';

// utils
import { withFormik, FormikProps, Form as FormikForm } from 'formik';
import eventEmitter from 'utils/eventEmitter';

// components
import { Grid, Segment } from 'semantic-ui-react';
import ContentContainer from 'components/ContentContainer';
import LabelWithTooltip from './LabelWithTooltip';
import Error from 'components/UI/Error';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToFileObservable } from 'utils/imageTools';
import { Section, SectionTitle, SectionSubtitle, SectionField } from 'components/admin/Section';
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
}

type Props = InputProps & InjectedIntlProps & injectedLocalized & FormikProps<IUserUpdate>;

class ProfileForm extends React.PureComponent<Props, State> {
  localeOptions: IOption[] = [];
  genderOptions: IOption[] = [];
  domicileOptions: IOption[] = [];
  birthYearOptions: IOption[] = [];
  educationOptions: IOption[] = [];
  user$: Rx.BehaviorSubject<IUserData>;
  customFieldsFormData: any;
  subscriptions: Rx.Subscription[];

  constructor(props: InputProps) {
    super(props as any);
    this.state = {
      avatar: null,
      hasCustomFields: false,
      contextRef: null,
      localeOptions: [],
    };
    this.customFieldsFormData = null;
    this.subscriptions = [];
  }

  componentDidMount() {
    this.user$ = new Rx.BehaviorSubject(this.props.user);
    const locale$ = localeStream().observable;
    const customFieldsSchemaForUsersStream$ = customFieldsSchemaForUsersStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.user$,
        locale$,
        customFieldsSchemaForUsersStream$
      ).switchMap(([user, locale, customFieldsSchema]) => {
        const hasCustomFields = !isEmpty(customFieldsSchema['json_schema_multiloc'][locale]['properties']);
        const avatarUrl = get(user, 'attributes.avatar.medium', null);
        return (avatarUrl ? convertUrlToFileObservable(avatarUrl) : Rx.Observable.of(null)).map(avatar => ({ avatar, hasCustomFields }));
      }).subscribe(({ avatar, hasCustomFields }) => {
        this.setState({
          hasCustomFields,
          avatar: (avatar ? [avatar] : null)
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

    this.genderOptions = [
      {
        value: 'male',
        label: this.props.intl.formatMessage({ ...messages.male }),
      },
      {
        value: 'female',
        label: this.props.intl.formatMessage({ ...messages.female }),
      },
      {
        value: 'unspecified',
        label: this.props.intl.formatMessage({ ...messages.unspecified })
      }
    ];

    this.domicileOptions = this.props.areas.map((area) => ({
      value: area.id,
      label: this.props.localize(area.attributes.title_multiloc),
    }));

    this.domicileOptions.push({
      value: 'outside',
      label: this.props.intl.formatMessage({
        ...messages.outside }
      ),
    });

    for (let i = parseInt(moment().format('YYYY'), 10); i >= 1900; i -= 1) {
      this.birthYearOptions.push({
        value: i,
        label: i.toString(),
      });
    }

    for (let i = 0; i <= 8; i += 1) {
      this.educationOptions.push({
        value: i,
        label: this.props.intl.formatMessage({ ...{ ...messages }[`ISCED11_${i}`] }),
      });
    }
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

  getToggleValue = (property) => {
    const { user } = this.props;

    if (!user) {
      return false;
    }

    return user[property];
  }

  createChangeHandler = (fieldName) => value => {
    if (/_multiloc$/.test(fieldName)) {
      this.props.setFieldValue(fieldName, { [this.props.locale]: value });
    } else if (value && value.value) {
      this.props.setFieldValue(fieldName, value.value);
    } else {
      this.props.setFieldValue(fieldName, value);
    }
  }

  createBlurHandler = (fieldName) => () => {
    this.props.setFieldTouched(fieldName, true);
  }

  handleAvatarOnAdd = (newAvatar: ImageFile) => {
    this.setState(() => ({ avatar: [newAvatar] }));
    this.props.setFieldValue('avatar', newAvatar.base64);
    this.props.setFieldTouched('avatar');
  }

  handleAvatarOnUpdate = (updatedAvatar: ImageFile[]) => {
    const avatar = (updatedAvatar && updatedAvatar.length > 0 ? updatedAvatar : null);
    this.setState({ avatar });
    this.props.setFieldValue('avatar', updatedAvatar[0].base64);
    this.props.setFieldTouched('avatar');
  }

  handleAvatarOnRemove = async () => {
    this.setState(() => ({ avatar: null }));
    this.props.setFieldValue('avatar', null);
    this.props.setFieldTouched('avatar');
  }

  handleContextRef = (contextRef) => {
    this.setState({ contextRef });
  }

  getStatus = () => {
    const { isValid,  status, touched } = this.props;

    if (!isEmpty(touched) && !isValid) {
      return 'error';
    }

    if (isEmpty(touched) && status === 'success') {
      return 'success';
    }

    return 'enabled';
  }

  handleCustomFieldsFormOnSubmit = (formData) => {
    this.customFieldsFormData = formData;
    this.props.submitForm();
  }

  handleOnSubmit = () => {
    // console.log('zolg');
    if (this.state.hasCustomFields) {
      eventEmitter.emit('ProfileForm', 'customFieldsSubmitEvent', null);
    } else {
      this.props.submitForm();
    }
  }

  render() {
    const { hasCustomFields } = this.state;
    const { user, intl: { formatMessage }, values, errors, isSubmitting } = this.props;

    return (
      <StyledContentContainer>
        <Grid centered>
          <Grid.Row>
            <Grid.Column computer={12} mobile={16}>
              <div ref={this.handleContextRef}>
                <Segment padded="very">
                  <FormikForm className="e2e-profile-edit-form" noValidate>
                    {/* BASICS */}
                    <Section ref={(section1) => { this['section-basics'] = section1; }}>
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
                          onAdd={this.handleAvatarOnAdd}
                          onUpdate={this.handleAvatarOnUpdate}
                          onRemove={this.handleAvatarOnRemove}
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
                          onChange={this.createChangeHandler('first_name')}
                          onBlur={this.createBlurHandler('first_name')}
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
                          onChange={this.createChangeHandler('last_name')}
                          onBlur={this.createBlurHandler('last_name')}
                        />
                        <Error apiErrors={errors.last_name} />
                      </SectionField>

                      <SectionField>
                        <LabelWithTooltip id="email" />
                        <Input
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={this.createChangeHandler('email')}
                          onBlur={this.createBlurHandler('email')}
                        />
                        <Error apiErrors={errors.email} />
                      </SectionField>

                      <SectionField>
                        <LabelWithTooltip id="bio" />
                        <TextArea
                          name="bio_multiloc"
                          onChange={this.createChangeHandler('bio_multiloc')}
                          onBlur={this.createBlurHandler('bio_multiloc')}
                          rows={6}
                          placeholder={formatMessage({ ...messages.bio_placeholder })}
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
                          onChange={this.createChangeHandler('password')}
                          onBlur={this.createBlurHandler('password')}
                        />
                        <Error apiErrors={errors.password} />
                      </SectionField>

                      <SectionField>
                        <LabelWithTooltip id="language" />
                        <Select
                          onChange={this.createChangeHandler('locale')}
                          onBlur={this.createBlurHandler('locale')}
                          value={values.locale}
                          options={this.state.localeOptions}
                        />
                        <Error apiErrors={errors.locale} />
                      </SectionField>
                    </Section>
                  </FormikForm>

                  {hasCustomFields &&
                    <CustomFieldsForm 
                      formData={user.attributes.custom_field_values}
                      onSubmit={this.handleCustomFieldsFormOnSubmit}
                    />
                  }

                  {/* DETAILS */}
                  {/*
                  <Section ref={(section2) => { this['section-details'] = section2; }}>
                    <SectionTitle>
                      <FormattedMessage {...messages.h2} />
                    </SectionTitle>

                    <SectionSubtitle>
                      <FormattedMessage {...messages.h2sub} />
                    </SectionSubtitle>
                  </Section>
                  */}

                  <SubmitWrapper
                    status={this.getStatus()}
                    style="primary"
                    loading={isSubmitting}
                    onClick={this.handleOnSubmit}
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
      </StyledContentContainer>);
  }
}

export default withFormik<InputProps, IUserUpdate, IUserUpdate>({
  handleSubmit: (values, { props, setSubmitting, resetForm, setErrors, setStatus }) => {
    setStatus('');

    updateUser(props.user.id, values).then(() => {
      resetForm();
      setStatus('success');
    }).catch((errorResponse) => {
      if (errorResponse.json) {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      }
    });
  },
  mapPropsToValues: (props) => {
    return mapUserToDiff(props.user);
  }
})(injectIntl<any>(localize(ProfileForm)));

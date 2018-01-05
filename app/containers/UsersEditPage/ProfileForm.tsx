// Libraries
import * as React from 'react';
import { omitBy, transform } from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';

// Services & Utils
import { IAreaData } from 'services/areas';
import { updateUser, IUserData, IUserUpdate, mapUserToDiff } from 'services/users';
import { ITenantData } from 'services/tenant';
import scrollToComponent from 'react-scroll-to-component';
import { withFormik, FormikProps, Form, Field } from 'formik';
import { IOption, ImageFile, API } from 'typings';

// Components
import { Grid, Menu, Segment } from 'semantic-ui-react';
import ContentContainer from 'components/ContentContainer';
import Button from 'components/UI/Button';
import LabelWithTooltip from './LabelWithTooltip';
import TextArea from 'components/UI/TextArea';
import Input from 'components/UI/Input';
import Error from 'components/UI/Error';
import Select from 'components/UI/Select';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToFileObservable } from 'utils/imageTools';
import { Section, SectionTitle, SectionSubtitle, SectionField } from 'components/admin/Section';

// i18n
import { appLocalePairs } from 'i18n';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import localize, { injectedLocalized } from 'utils/localize';

// Style
import styled from 'styled-components';
import { color, fontSize, media } from 'utils/styleUtils';

const StyledContentContainer = styled(ContentContainer)`
  background: #fff;
`;

// Types
interface Props {
  user: IUserData;
  areas: IAreaData[];
  tenant: ITenantData;
}

interface State {
  avatar: ImageFile[] | null;
}

class ProfileForm extends React.Component<Props & InjectedIntlProps & injectedLocalized & FormikProps<IUserUpdate>, State> {
  localeOptions: IOption[] = [];
  genderOptions: IOption[] = [];
  domicileOptions: IOption[] = [];
  birthYearOptions: IOption[] = [];
  educationOptions: IOption[] = [];

  constructor(props) {
    super(props);

    this.state = {
      avatar: null,
    };
  }

  componentWillMount() {
    // Get the avatar imageFile
    const avatarUrl = this.props.user.attributes.avatar.medium;
    const avatarFileObservable = this.props.user.attributes.avatar.medium ? convertUrlToFileObservable(avatarUrl) : Observable.of(null);

    avatarFileObservable
    .first()
    .subscribe((avatar) => {
      if (avatar) this.setState({ avatar: [avatar] });
    });

    // Create options arrays only once, avoid re-calculating them on each render
    this.localeOptions = this.props.tenantLocales.map((locale) => ({
      value: locale,
      label: appLocalePairs[locale],
    }));

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
        label: this.props.intl.formatMessage({ ...messages.unspecified }),
      },
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

  getToggleValue = (property) => {
    const { user } = this.props;
    if (!user) {
      return false;
    }
    return user[property];
  }

  createMenuClickHandler = (name: string) => () => {
    this.goToSection(name);
  }

  goToSection = (which) => {
    if (which === 'h1') {
      scrollToComponent(this['section-basics']);
    } else if (which === 'h2') {
      scrollToComponent(this['section-details']);
    } else if (which === 'h3') {
      scrollToComponent(this['section-notifications']);
    }
  }

  createChangeHandler = (fieldName) => value => {
    if (/_multiloc$/.test(fieldName)) {
      this.props.setFieldValue(fieldName, { [this.props.locale]: value });
    } else if (value.value) {
      this.props.setFieldValue(fieldName, value.value);
    } else {
      this.props.setFieldValue(fieldName, value);
    }
  }

  createBlurHandler = (fieldName) => () => {
    // this is going to call setFieldTouched and manually update touched.topcis
    this.props.setFieldTouched(fieldName, true);
  }

  isOptionEnabled = (optionName) => {
    return this.props.tenant.attributes.settings.demographic_fields[optionName];
  }

  handleAvatarOnAdd = (newAvatar: ImageFile) => {
    this.setState((state: State) => ({
      avatar: [newAvatar],
    }));

    this.props.setFieldValue('avatar', newAvatar.base64);
    this.props.setFieldTouched('avatar');
  }

  handleAvatarOnUpdate = (updatedAvatar: ImageFile[]) => {
    const avatar = (updatedAvatar && updatedAvatar.length > 0 ? updatedAvatar : null);
    this.setState({ avatar });
    this.props.setFieldValue('avatar', updatedAvatar[0].base64);
    this.props.setFieldTouched('avatar');
  }

  handleAvatarOnRemove = async (removedAvatar: ImageFile) => {
    this.setState((state: State) => ({ avatar: null }));
    this.props.setFieldValue('avatar', null);
    this.props.setFieldTouched('avatar');
  }


  render() {
    const { user, intl: { formatMessage }, values, touched, errors, isSubmitting, handleChange, handleBlur, isValid, dirty } = this.props;

    return (
      <StyledContentContainer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4} only="computer">
              <Menu fluid vertical tabular>
                <Menu.Item name="h1" onClick={this.createMenuClickHandler('h1')}><FormattedMessage {...messages.h1} /></Menu.Item>
                <Menu.Item name="h2" onClick={this.createMenuClickHandler('h2')}><FormattedMessage {...messages.h2} /></Menu.Item>
              </Menu>
            </Grid.Column>
            <Grid.Column computer={12} mobile={16}>
              <Segment padded="very">
                <Form className="e2e-profile-edit-form" noValidate>
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
                      />
                      <Error apiErrors={errors.avatar} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="firstName" />
                      <Input
                        type="text"
                        name="first_name"
                      />
                      <Error apiErrors={errors.first_name} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="lastName" />
                      <Field name="last_name" />
                      <Error apiErrors={errors.last_name} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="email" />
                      <Field type="email" name="email" />
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
                      <Field type="password" name="password" />
                      <Error apiErrors={errors.password} />
                    </SectionField>

                    <SectionField>
                      <LabelWithTooltip id="language" />
                      <Select
                        onChange={this.createChangeHandler('locale')}
                        onBlur={this.createBlurHandler('locale')}
                        value={values.locale}
                        options={this.localeOptions}
                      />
                      <Error apiErrors={errors.locale} />
                    </SectionField>
                  </Section>

                  {/* DETAILS */}
                  <Section ref={(section2) => { this['section-details'] = section2; }}>
                    <SectionTitle>
                      <FormattedMessage {...messages.h2} />
                    </SectionTitle>
                    <SectionSubtitle>
                      <FormattedMessage {...messages.h2sub} />
                    </SectionSubtitle>

                    {this.isOptionEnabled('gender') &&
                      <SectionField>
                        <LabelWithTooltip id="gender" />
                        <Select
                          placeholder={formatMessage({ ...messages.male })}
                          options={this.genderOptions}
                          onChange={this.createChangeHandler('gender')}
                          value={values.gender}
                        />
                        <Error apiErrors={errors.gender} />
                      </SectionField>
                    }

                    {this.isOptionEnabled('domicile') &&
                      <SectionField>
                        <LabelWithTooltip id="domicile" />
                        <Select
                          placeholder={formatMessage({ ...messages.domicile_placeholder })}
                          options={this.domicileOptions}
                          onChange={this.createChangeHandler('domicile')}
                          value={values.domicile}
                        />
                        <Error apiErrors={errors.domicile} />
                      </SectionField>
                    }
                    {this.isOptionEnabled('birthyear') &&
                      <SectionField>
                        <LabelWithTooltip id="birthdate" />
                        <Select
                          options={this.birthYearOptions}
                          onChange={this.createChangeHandler('birthyear')}
                          value={`${values.birthyear}`}
                        />
                        <Error apiErrors={errors.birthyear} />
                      </SectionField>
                    }

                    {this.isOptionEnabled('education') &&
                      <SectionField>
                        <LabelWithTooltip id="education" />
                        <Select
                          placeholder={formatMessage({ ...messages.education_placeholder })}
                          options={this.educationOptions}
                          onChange={this.createChangeHandler('education')}
                          value={values.education}
                        />
                        <Error apiErrors={errors.education} />
                      </SectionField>
                    }
                  </Section>

                  <Button
                    id="e2e-profile-edit-form-button"
                    text={
                      dirty && !isValid
                      ? <FormattedMessage {...messages.buttonErrorLabel} />
                      : <FormattedMessage {...messages.submit} />
                    }
                    processing={isSubmitting}
                    style={dirty && !isValid ? 'error' : 'primary'}
                  />
                </Form>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </StyledContentContainer>);
  }
}

export default withFormik<Props, IUserUpdate, IUserUpdate>({
  handleSubmit: (values, { props, setSubmitting, resetForm, setErrors }) => {
    updateUser(props.user.id, values)
    .then(() => {
      resetForm();
    })
    .catch((errorResponse) => {
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
})(injectIntl(localize(ProfileForm)));

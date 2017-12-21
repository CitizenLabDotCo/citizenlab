// Libraries
import * as React from 'react';
import _ from 'lodash';
import * as moment from 'moment';

// Services & Utils
import { IAreaData } from 'services/areas';
import { IUserData } from 'services/users';
import { ITenantData } from 'services/tenant';
import scrollToComponent from 'react-scroll-to-component';

// Components
import Button from 'components/UI/Button';
import { Grid } from 'semantic-ui-react';
import Avatar from './Avatar';
import generateErrorsObject from 'components/forms/generateErrorsObject';
import ContentContainer from 'components/ContentContainer';
import Input from 'components/UI/Input';
import Select from 'components/UI/Select';
import TextArea from 'components/UI/TextArea';
import LabelWithTooltip from './LabelWithTooltip';
import ImagesDropzone from 'components/UI/ImagesDropzone';


// i18n
import { appLocalePairs } from 'i18n';
import messages from '../messages';
import { injectTFunc } from 'components/T/utils';
import { intlShape } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// Style
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  background: #fff;
`;

const NavItemStyled = styled.button`
  display: block;
  height: 26px;
  font-size: 18px;
  font-weight: 500;
  text-align: left;
  color: #222222;
`;

const Nav = ({ goTo }) => (
  <div>
    <NavItemStyled onClick={() => goTo('h1')}>
      <FormattedMessage {...messages.h1} />
    </NavItemStyled>
    <NavItemStyled onClick={() => goTo('h2')}>
      <FormattedMessage {...messages.h2} />
    </NavItemStyled>
  </div>
);

const InputGroupStyled = styled.div`
  margin-top: 40px;
`;

const SectionHeaderStyled = styled.div`
  font-size: 25px;
  font-weight: bold;
  text-align: left;
  color: #222222;
  padding: 0.5rem 0;
`;

const SectionSubHeaderStyled = styled.div`
  font-size: 16px;
  text-align: left;
  color: #6b6b6b;
  padding: 0.5rem 0;
`;

const LabelInputPairStyled = styled.div`
  margin-top: 10px;
`;

const SectionSeparatorStyled = styled.hr`
  border: none;
  height: 3px;
  width: 100%;
  /* Set the hr color */
  color: #eaeaea; /* old IE */
  background-color: #eaeaea; /* Modern Browsers */
`;

const FormContentWrapper = styled(Grid.Column)`
  border-left: 1px solid #eaeaea;
  padding: 36px;
`;

// Types
interface Props {
  user: IUserData;
  areas: IAreaData[];
  tenant: ITenantData;
}

interface State {}

class ProfileForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      avatar: '',
      areas: [],
    };
  }

  getToggleValue = (property) => {
    const { user } = this.state;
    if (!user) {
      return false;
    }
    return user[property];
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

  handleAvatarUpload = (avatarBase64, userId) => {
    this.props.avatarUpload(avatarBase64, userId);
  }

  handleInputChange = (value, name) => {
    const { user } = _.clone(this.state);

    user[name] = value;
    this.setState({
      user,
    });
  }

  handleMultilocInputChange = (value, name) => {
    const { user } = _.clone(this.state);

    user[name][this.state.user.locale] = value;
    this.setState({
      user,
    });
  }

  createMultiLocChangeHandler = (name) => (value) => {
    this.handleMultilocInputChange(value, name);
  }

  // Select
  handleSelectChange = (option, name) => {
    const { user } = _.clone(this.state);

    user[name] = option.value;
    this.setState({
      user,
    });
  }

  // Toggle
  handleToggleChange = (name) => {
    const { user } = _.clone(this.state);

    user[name] = !user[name];
    this.setState({
      user,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { user } = this.state;

    this.props.onFormSubmit(user);
  }

  localeOptions = () => {
    return this.props.locales.map((locale) => ({
      value: locale,
      label: appLocalePairs[locale],
    })).toJS();
  }

  genderOptions = () => ([
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
  ]);

  domicileOptions = () => {
    const options = this.state.areas.map((area) => ({
      value: area.id,
      label: this.props.tFunc(area.attributes.title_multiloc),
    }));
    options.push({
      value: 'outside',
      label: this.props.intl.formatMessage({
        ...messages.outside },
        {
          name: this.props.tFunc(this.props.organizationName),
          organizationType: this.props.organizationType,
        }
      ),
    });
    return options;
  }

  birthYearOptions = () => {
    const options = [];
    for (let i = parseInt(moment().format('YYYY'), 10); i >= 1900; i -= 1) {
      options.push({
        value: i,
        label: i.toString(),
      });
    }
    return options;
  }

  educationOptions = () => {
    const options = [];
    for (let i = 0; i <= 8; i += 1) {
      options.push({
        value: i,
        label: this.props.intl.formatMessage({ ...{ ...messages }[`ISCED11_${i}`] }),
      });
    }
    return options;
  }

  render() {
    const {} = this.props;

    const user = this.state.user;

    const userErrors = storeErrors && generateErrorsObject(storeErrors);

    return (
      <StyledContentContainer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4} only="computer">
              <Nav goTo={this.goToSection} />
            </Grid.Column>
            <Grid.Column computer={12} mobile={16}>
              <FormContentWrapper id="e2e-profile-edit-form">
                {/* BASICS */}
                <section ref={(section1) => { this['section-basics'] = section1; }}>
                  <SectionHeaderStyled>
                    <FormattedMessage {...messages.h1} />
                  </SectionHeaderStyled>
                  <SectionSubHeaderStyled>
                    <FormattedMessage {...messages.h1sub} />
                  </SectionSubHeaderStyled>

                  {user && user.userId && <Avatar
                    onAvatarUpload={this.handleAvatarUpload}
                    avatarUploadError={avatarUploadError}
                    avatarURL={user.avatar}
                    userId={user.userId}
                  />}

                  <InputGroupStyled>
                    <LabelInputPairStyled>
                      <LabelWithTooltip id="firstName" />
                      <Input
                        id="first_name"
                        key="first_name"
                        name="first_name"
                        onChange={(value) => this.handleInputChange(value, 'first_name')}
                        value={user && user.first_name}
                        error={userErrors && userErrors.first_name && userErrors.first_name[0]}
                      />
                    </LabelInputPairStyled>
                    <LabelInputPairStyled>
                      <LabelWithTooltip id="lastName" />
                      <Input
                        id="last_name"
                        name="last_name"
                        onChange={(value) => this.handleInputChange(value, 'last_name')}
                        value={user && user.last_name}
                        error={userErrors && userErrors.last_name && userErrors.last_name[0]}
                      />
                    </LabelInputPairStyled>
                    <LabelInputPairStyled>
                      <LabelWithTooltip id="email" />
                      <Input
                        id="email"
                        name="email"
                        onChange={(value) => this.handleInputChange(value, 'email')}
                        value={user && user.email}
                        error={userErrors && userErrors.email && userErrors.email[0]}
                      />
                    </LabelInputPairStyled>
                    <LabelWithTooltip id="bio" />
                    <TextArea
                      name="bio_multiloc"
                      onChange={this.createMultiLocChangeHandler('bio_multiloc')}
                      rows={6}
                      placeholder={intl.formatMessage({ ...messages.bio_placeholder })}
                      value={tFunc(user.bio_multiloc)}
                      error={userErrors && userErrors.bio_multiloc && userErrors.bio_multiloc[0]}
                    />
                    <LabelInputPairStyled>
                      <LabelWithTooltip id="password" />
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        onChange={(value) => this.handleInputChange(value, 'password')}
                        value={user && user.password}
                        error={userErrors && userErrors.password && userErrors.password[0]}
                      />
                    </LabelInputPairStyled>
                    <LabelInputPairStyled>
                      <LabelWithTooltip id="language" />
                      {<Select
                        name="locale"
                        onChange={(option) => this.handleInputChange(option.value, 'locale')}
                        value={user.locale}
                        options={this.localeOptions()}
                      />}
                    </LabelInputPairStyled>
                  </InputGroupStyled>
                </section>

                <SectionSeparatorStyled
                  style={{
                    margin: '60px 0',
                  }}
                />

                {/* DETAILS */}
                <section ref={(section2) => { this['section-details'] = section2; }}>
                  <SectionHeaderStyled>
                    <FormattedMessage {...messages.h2} />
                  </SectionHeaderStyled>
                  <SectionSubHeaderStyled>
                    <FormattedMessage {...messages.h2sub} />
                  </SectionSubHeaderStyled>

                  <InputGroupStyled>
                    {this.props.genderEnabled &&
                      <div>
                        <LabelWithTooltip id="gender" />
                        <Select
                          name="gender"
                          placeholder={intl.formatMessage({ ...messages.male })}
                          options={this.genderOptions()}
                          onChange={(option) => this.handleInputChange(option.value, 'gender')}
                          value={user.gender}
                          error={userErrors && userErrors.gender && userErrors.gender[0]}
                        />
                      </div>
                    }

                    {this.props.domicileEnabled &&
                      <div>
                        <LabelWithTooltip id="domicile" />
                        <Select
                          name="domicile"
                          placeholder={intl.formatMessage({ ...messages.domicile_placeholder })}
                          options={this.domicileOptions()}
                          onChange={(option) => this.handleInputChange(option.value, 'domicile')}
                          value={user.domicile}
                          error={userErrors && userErrors.domicile && userErrors.domicile[0]}
                        />
                      </div>
                    }
                    {this.props.birthyearEnabled &&
                      <div>
                        <LabelWithTooltip id="birthdate" />
                        <Select
                          name="birthyear"
                          options={this.birthYearOptions()}
                          onChange={(option) => this.handleInputChange(option.value, 'birthyear')}
                          value={user.birthyear}
                          error={userErrors && userErrors.birthyear && userErrors.birthyear[0]}
                        />
                      </div>
                    }

                    {this.props.educationEnabled &&
                      <div>
                        <LabelWithTooltip id="education" />
                        <Select
                          name="education"
                          placeholder={intl.formatMessage({ ...messages.education_placeholder })}
                          options={this.educationOptions()}
                          onChange={(option) => this.handleInputChange(option.value, 'education')}
                          value={user.education}
                          error={userErrors && userErrors.education && userErrors.education[0]}
                        />
                      </div>
                    }


                  </InputGroupStyled>
                </section>

                <SectionSeparatorStyled
                  style={{
                    margin: '48px 0 25px 0',
                  }}
                />

                <Button
                  id="e2e-profile-edit-form-button"
                  text={intl.formatMessage({ ...messages.submit })}
                  onClick={this.handleSubmit}
                  processing={processing}
                />
              </FormContentWrapper>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </StyledContentContainer>);
  }
}

export default ProfileForm;

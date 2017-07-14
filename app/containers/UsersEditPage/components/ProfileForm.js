import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/UI/Button';
import { Grid, Radio } from 'semantic-ui-react';
import { appLocalePairs } from 'i18n';
import ImmutablePropTypes from 'react-immutable-proptypes';
import messages from '../messages';
import Avatar from './Avatar';
import generateErrorsObject from 'components/forms/generateErrorsObject';
import _ from 'lodash';
import { connect } from 'react-redux';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { createStructuredSelector } from 'reselect';
import Input from 'components/UI/Input';
import Select from 'components/UI/Select';
import styled from 'styled-components';
import scrollToComponent from 'react-scroll-to-component';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import LabelWithTooltip from './LabelWithTooltip';
import TextArea from 'components/UI/TextArea';
import { injectTFunc } from 'containers/T/utils';
import moment from 'moment';

const NavItemStyled = styled.button`
  display: block;
  // TODO
`;

const Nav = ({ goTo }) => (<div>
  <NavItemStyled onClick={() => goTo('h1')}>
    <FormattedMessage {...messages.h1} />
  </NavItemStyled>
  <NavItemStyled onClick={() => goTo('h2')}>
    <FormattedMessage {...messages.h2} />
  </NavItemStyled>
  <NavItemStyled onClick={() => goTo('h3')}>
    <FormattedMessage {...messages.h3} />
  </NavItemStyled>
</div>);

Nav.propTypes = {
  goTo: PropTypes.func.isRequired,
};

class ProfileForm extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      user: null,
      avatar: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    const user = nextProps.userData;

    if (!this.state.user || _.isEmpty(this.state.user)) {
      this.setState({
        user,
      });
    }

    this.setState({
      avatar: user && user.avatar,
    });
  }

  getToggleValue = (property) => {
    const { user } = this.state;
    if (!user) {
      return false;
    }
    return user[property];
  };

  goToSection = (which) => {
    if (which === 'h1') {
      scrollToComponent(this['section-basics']);
    } else if (which === 'h2') {
      scrollToComponent(this['section-details']);
    } else if (which === 'h3') {
      scrollToComponent(this['section-notifications']);
    }
  };

  handleAvatarUpload = (avatarBase64, userId) => {
    this.props.avatarUpload(avatarBase64, userId);
  };

  // Input, Textarea
  handleInputChange = (value, name) => {
    const { user } = this.state;
    user[name] = value;
    this.setState({
      user,
    });
  };

  // Select
  handleSelectChange = (option, name) => {
    const { user } = this.state;
    user[name] = option.value;
    this.setState({
      user,
    });
  };

  // Switch
  handleToggleChange = (name) => {
    const { user } = this.state;
    user[name] = !user[name];
    this.setState({
      user,
    });
  };

  handleSubmit(e) {
    e.preventDefault();
    const { user } = this.state;
    const { userData } = this.props;

    const userWithLocale = Object.assign({}, user);
    userWithLocale.locale = userData.locale;

    this.props.onFormSubmit(userWithLocale);
  }

  render() {
    const {
      avatarUploadError, userData: user, onLocaleChangeClick, className,
      processing, storeErrors, locales, intl, tFunc,
    } = this.props;
    const userLocale = (user
      ? user.locale
      : 'en');
    const localesJS = locales.toJS();

    const userErrors = storeErrors && generateErrorsObject(storeErrors);

    /*
     * styled components
    */
    const RightColumnStyled = styled(Grid.Column)`
      // TODO
    `;

    const InputGroupStyled = styled.div`
      margin-top: 40px;
    `;

    const SectionHeaderStyled = styled(FormattedMessage)`
      // TODO
    `;

    const SectionSubHeaderStyled = styled(FormattedMessage)`
      // TODO
    `;

    const LabelInputPairStyled = styled.div`
      // TODO
    `;

    const SectionSeparatorStyled = styled.hr`
      border: none;
      height: 3px;
      width: 100%;
      /* Set the hr color */
      color: #eaeaea; /* old IE */
      background-color: #eaeaea; /* Modern Browsers */
    `;

    const StyledRadio = styled(Radio)`
      label:before {
        /* ! cannot override as important is already set on the styled radio */
        background-color: ${(props) => props.checked ? '#3fb57c !important' : 'inherit'};
        border-radius: 500rem;
      }
    `;

    /*
     * props
     */
    const genderOptions = [
      {
        value: 'male',
        label: intl.formatMessage(messages.male),
      },
      {
        value: 'female',
        label: intl.formatMessage(messages.female),
      },
    ];

    const birthYearOptions = [];
    for (let i = parseInt(moment().format('YYYY'), 10); i >= 1900; i -= 1) {
      birthYearOptions.push({
        value: i.toString(),
        label: i.toString(),
      });
    }

    const educationOptions = [];
    for (let i = 0; i <= 8; i += 1) {
      educationOptions.push({
        value: `ISCED11_${i}`,
        label: intl.formatMessage(messages[`ISCED11_${i}`]),
      });
    }

    const areas = [];
    // TODO: areas from selector

    return (<div className={className}>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}>
            <Nav goTo={this.goToSection} />
          </Grid.Column>
          <RightColumnStyled width={12}>
            {/* BASICS */}
            <div ref={(section1) => { this['section-basics'] = section1; }}>
              <SectionHeaderStyled {...messages.h1} />
              <SectionSubHeaderStyled {...messages.h1sub} />

              {/* TODO: style properly and add icon (+ logic) to trash avatar (i.e. send null) */}
              {user && user.userId && <Avatar
                onAvatarUpload={this.handleAvatarUpload}
                avatarUploadError={avatarUploadError}
                avatarURL={user.avatar}
                userId={user.userId}
              />}

              <InputGroupStyled>
                <LabelInputPairStyled>
                  <LabelWithTooltip id="firstName" hasTooltip />
                  <Input
                    name="firstName"
                    onChange={this.handleInputChange}
                    value={user && user.first_name}
                    error={userErrors && userErrors.first_name && userErrors.first_name[0]}
                  />
                </LabelInputPairStyled>
                <LabelInputPairStyled>
                  <LabelWithTooltip id="lastName" hasTooltip />
                  <Input
                    name="lastName"
                    onChange={this.handleInputChange}
                    value={user && user.last_name}
                    error={userErrors && userErrors.last_name && userErrors.last_name[0]}
                  />
                </LabelInputPairStyled>
                <LabelInputPairStyled>
                  <LabelWithTooltip id="email" hasTooltip />
                  <Input
                    name="email"
                    onChange={this.handleInputChange}
                    value={user && user.email}
                    error={userErrors && userErrors.email && userErrors.email[0]}
                  />
                </LabelInputPairStyled>
                <LabelInputPairStyled>
                  <LabelWithTooltip id="password" hasTooltip />
                  <Input
                    name="password"
                    onChange={this.handleInputChange}
                    value={user && user.password}
                    error={userErrors && userErrors.password && userErrors.password[0]}
                  />
                </LabelInputPairStyled>

                {localesJS && <Select
                  name="locale"
                  onChange={onLocaleChangeClick}
                  value={appLocalePairs.find((l) => l.value === userLocale)}
                  options={appLocalePairs.filter((locale) => localesJS.find((l) => l === locale.value))}
                />}
              </InputGroupStyled>
            </div>

            <SectionSeparatorStyled
              style={{
                margin: '60px 0',
              }}
            />

            {/* DETAILS */}
            <div ref={(section2) => { this['section-details'] = section2; }}>
              <SectionHeaderStyled {...messages.h2} />
              <SectionSubHeaderStyled {...messages.h2sub} />

              <InputGroupStyled>
                <LabelWithTooltip id="gender" hasTooltip />
                <Select
                  name="gender"
                  placeholder={intl.formatMessage(messages.male)}
                  options={genderOptions}
                  onChange={this.handleSelectChange}
                  value={{
                    value: user.gender,
                    label: user.gender && intl.formatMessage(messages[user.gender]),
                  }}
                  error={userErrors && userErrors.gender[0]}
                />

                <LabelWithTooltip id="bio" hasTooltip />
                <TextArea
                  name="bio_multiloc"
                  onInput={this.handleInputChange}
                  rows={6}
                  placeholder={intl.formatMessage(messages.bio_placeholder)}
                  value={user.bio_multiloc && tFunc(user.bio_multiloc)}
                  error={userErrors && userErrors.bio_multiloc && userErrors.bio_multiloc[0]}
                />

                <LabelWithTooltip id="area" />
                <Select
                  name="area_multiloc"
                  placeholder={intl.formatMessage(messages.area_placeholder)}
                  options={areas}
                  onChange={this.handleSelectChange}
/*                  value={{
                    value: user.domicilie,
                    label: user.domicilie,
                  }}*/
                  error={userErrors && userErrors.domicilie && userErrors.domicilie[0]}
                />

                <LabelWithTooltip id="birthdate" />
                <Select
                  name="birthdate"
                  options={birthYearOptions}
                  onChange={this.handleSelectChange}
                  value={{
                    value: user.birthyear,
                    label: user.birthyear,
                  }}
                  error={userErrors && userErrors.birthyear && userErrors.birthyear[0]}
                />

                <LabelWithTooltip id="education" />
                <Select
                  name="education"
                  placeholder={intl.formatMessage(messages.area_placeholder)}
                  options={educationOptions}
                  onChange={this.handleSelectChange}
                  value={{
                    value: user.education,
                    label: user.education && intl.formatMessage(messages[user.education]),
                  }}
                  error={userErrors && userErrors.education && userErrors.education[0]}
                />

              </InputGroupStyled>
            </div>

            <SectionSeparatorStyled
              style={{
                margin: '48px 0 25px 0',
              }}
            />

            {/* NOTIFICATIONS */}
            <div ref={(section3) => { this['section-notifications'] = section3; }}>
              <SectionHeaderStyled {...messages.h3} />
              <SectionSubHeaderStyled {...messages.h3sub} />

              <InputGroupStyled>
                <LabelWithTooltip id="notifications_all_email" isBold />
                <StyledRadio
                  toggle
                  checked={this.getToggleValue('notifications_all_email')}
                  onClick={() => this.handleToggleChange('notifications_all_email')}
                />

                <LabelWithTooltip id="notifications_idea_post" />
                <Radio toggle onClick={() => this.handleToggleChange('notifications_idea_post')} />

                <LabelWithTooltip id="notifications_new_user" />
                <Radio toggle onClick={() => this.handleToggleChange('notifications_new_user')} />

                <LabelWithTooltip id="notifications_new_comments" />
                <Radio toggle onClick={() => this.handleToggleChange('notifications_new_comments')} />
              </InputGroupStyled>

              <Button
                text={intl.formatMessage(messages.submit)}
                onClick={this.handleSubmit}
                loading={processing}
              />
            </div>
          </RightColumnStyled>
        </Grid.Row>
      </Grid>
    </div>);
  }
}

ProfileForm.propTypes = {
  className: PropTypes.string,
  onFormSubmit: PropTypes.func.isRequired,
  avatarUpload: PropTypes.func.isRequired,
  onLocaleChangeClick: PropTypes.func.isRequired,
  userData: PropTypes.object,
  avatarUploadError: PropTypes.bool,
  processing: PropTypes.bool,
  storeErrors: PropTypes.object,
  locales: ImmutablePropTypes.list,
  intl: intlShape.isRequired,
  tFunc: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  locales: makeSelectSetting(['core', 'locales']),
});

export default injectTFunc(injectIntl(connect(mapStateToProps)(styled(ProfileForm)`
  width: 80%;
  margin: auto;
`)));

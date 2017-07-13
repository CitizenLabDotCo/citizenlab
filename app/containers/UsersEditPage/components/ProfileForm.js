import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/buttons/loader';
import { Form, Grid } from 'semantic-ui-react';
import LocaleChanger from 'components/LocaleChanger';
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

const Nav = ({ onClick }) => (<div>
  <NavItemStyled onClick={onClick('h1')}>
    <FormattedMessage {...messages.h1} />
  </NavItemStyled>
  <NavItemStyled onClick={onClick('h2')}>
    <FormattedMessage {...messages.h2} />
  </NavItemStyled>
  <NavItemStyled onClick={onClick('h3')}>
    <FormattedMessage {...messages.h3} />
  </NavItemStyled>
</div>);

Nav.propTypes = {
  onClick: PropTypes.func.isRequired,
};

class ProfileForm extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      user: null,
      avatar: '',
    };

    // provide context to bindings
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAvatarUpload = this.handleAvatarUpload.bind(this);
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

  goToSection = (which) => {
    if (which === 'h1') {
      scrollToComponent(this['section-basics']);
    } else if (which === 'h2') {
      scrollToComponent(this['section-details']);
    } else if (which === 'h2') {
      scrollToComponent(this['section-notifications']);
    }
  };

  handleAvatarUpload = (avatarBase64, userId) => {
    this.props.avatarUpload(avatarBase64, userId);
  };

  handleChange = (name, value) => {
    // TODO: split into multiple handlers to handle multiloc attributes and events coming from different inputs
    // + take value via "name" attribute returned as 2nd arg of callback
    // + !
    // for gender empty = 'unspecified'
    // for education: parse from intl to 0-8

    const { user } = this.state;
    user[name] = value;
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

    const userErrors = storeErrors && generateErrorsObject(storeErrors);

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

    const genderOptions = [
      intl.formatMessage(messages.male),
      intl.formatMessage(messages.female),
    ];

    const birthYearOptions = [];
    for (let i = parseInt(moment().format('YYYY'), 10); i >= 1900; i -= 1) {
      birthYearOptions.push(i);
    }

    const educationOptions = [];
    for (let i = 0; i <= 8; i += 1) {
      educationOptions.push(intl.formatMessage(messages[`ISCED11_${i}`]));
    }

    return (
      <Form onSubmit={this.handleSubmit} className={className}>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}>
              <Nav onClick={this.goToSection} />
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
                <SectionSubHeaderStyled {...messages.username} />

                <InputGroupStyled>
                  <LabelInputPairStyled>
                    <LabelWithTooltip id="firstName" hasTooltip />
                    <Input
                      name="firstName"
                      onChange={this.handleChange}
                      value={user && user.first_name}
                      error={userErrors && userErrors.first_name && userErrors.first_name[0]}
                    />
                  </LabelInputPairStyled>
                  <LabelInputPairStyled>
                    <LabelWithTooltip id="lastName" hasTooltip />
                    <Input
                      name="lastName"
                      onChange={this.handleChange}
                      value={user && user.last_name}
                      error={userErrors && userErrors.last_name && userErrors.last_name[0]}
                    />
                  </LabelInputPairStyled>
                  <LabelInputPairStyled>
                    <LabelWithTooltip id="email" hasTooltip />
                    <Input
                      name="email"
                      onChange={this.handleChange}
                      value={user && user.email}
                      error={userErrors && userErrors.email && userErrors.email[0]}
                    />
                  </LabelInputPairStyled>
                  <LabelInputPairStyled>
                    <LabelWithTooltip id="password" hasTooltip />
                    <Input
                      name="password"
                      onChange={this.handleChange}
                      value={user && user.password}
                      error={userErrors && userErrors.password && userErrors.password[0]}
                    />
                  </LabelInputPairStyled>

                  {/* TODO: use component in components/../UI instead */}
                  {locales && <LocaleChanger
                    onLocaleChangeClick={onLocaleChangeClick}
                    userLocale={userLocale}
                    locales={locales.toJS()}
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
                <SectionHeaderStyled {...messages.h2sub} />

                <InputGroupStyled>
                  <LabelWithTooltip id="gender" hasTooltip />
                  <Select
                    name="gender"
                    placeholder={intl.formatMessage(messages.male)}
                    options={genderOptions}
                    onChange={this.handleChange}
                    value={user.gender}
                    error={userErrors && userErrors.gender[0]}
                  />

                  <LabelWithTooltip id="bio" hasTooltip />
                  <TextArea
                    name="bio_multiloc"
                    onInput={this.handleChange}
                    rows={6}
                    placeholder={intl.formatMessage(messages.bio_placeholder)}
                    value={user.bio_multiloc && tFunc(user.bio_multiloc)}
                    error={userErrors && userErrors.bio_multiloc && userErrors.bio_multiloc[0]}
                  />

                  <LabelWithTooltip id="area" />
                  <Select
                    name="area_multiloc"
                    placeholder={intl.formatMessage(messages.area_placeholder)}
                    options={genderOptions}
                    onChange={this.handleChange}
                    value={user.gender}
                    error={userErrors && userErrors.domicilie && userErrors.domicilie[0]}
                  />

                  <LabelWithTooltip id="birthdate" />
                  <Select
                    name="birthdate"
                    placeholder={intl.formatMessage(messages.area_placeholder)}
                    options={birthYearOptions}
                    onChange={this.handleChange}
                    value={user.birthyear}
                    error={userErrors && userErrors.birthyear && userErrors.birthyear[0]}
                  />

                  <LabelWithTooltip id="education" />
                  <Select
                    name="education"
                    placeholder={intl.formatMessage(messages.area_placeholder)}
                    options={educationOptions}
                    onChange={this.handleChange}
                    value={user.education}
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
                <SectionHeaderStyled {...messages.h3sub} />

                <InputGroupStyled>
                  {/* TODO (here labels + switchs from semantic-ui https://react.semantic-ui.com/addons/radio -> with 'toogle' attribute) */}
                </InputGroupStyled>
              </div>
            </RightColumnStyled>
          </Grid.Row>
        </Grid>
        <Button message={messages.submit} loading={processing} />
      </Form>
    );
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

export default injectTFunc(injectIntl(connect(mapStateToProps)(ProfileForm)));

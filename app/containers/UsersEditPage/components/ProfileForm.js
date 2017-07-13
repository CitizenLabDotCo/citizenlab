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
import styled from 'styled-components';
import scrollToComponent from 'react-scroll-to-component';
import { FormattedMessage } from 'react-intl';
import LabelWithTooltip from './LabelWithTooltip';

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
      processing, storeErrors, locales,
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
                    <Input onChange={this.handleChange} initialValue={user && user.first_name} error={userErrors && userErrors.first_name} />
                  </LabelInputPairStyled>
                  <LabelInputPairStyled>
                    <LabelWithTooltip id="lastName" hasTooltip />
                    <Input onChange={this.handleChange} initialValue={user && user.last_name} error={userErrors && userErrors.last_name_name} />
                  </LabelInputPairStyled>
                  <LabelInputPairStyled>
                    <LabelWithTooltip id="email" hasTooltip />
                    <Input onChange={this.handleChange} initialValue={user && user.email} error={userErrors && userErrors.email} />
                  </LabelInputPairStyled>
                  <LabelInputPairStyled>
                    <LabelWithTooltip id="oldPassword" hasTooltip />
                    <Input onChange={this.handleChange} initialValue={user && user.old_password} error={userErrors && userErrors.old_password} />
                  </LabelInputPairStyled>
                  <LabelInputPairStyled>
                    <LabelWithTooltip id="newPassword" hasTooltip />
                    <Input onChange={this.handleChange} initialValue={user && user.new_password} error={userErrors && userErrors.new_password} />
                  </LabelInputPairStyled>
                </InputGroupStyled>

                {/* TODO: use component in components/../UI instead */}
                {locales && <LocaleChanger
                  onLocaleChangeClick={onLocaleChangeClick}
                  userLocale={userLocale}
                  locales={locales.toJS()}
                />}
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
                  TODO
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
                  TODO
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
};

const mapStateToProps = createStructuredSelector({
  locales: makeSelectSetting(['core', 'locales']),
});

export default connect(mapStateToProps)(ProfileForm);

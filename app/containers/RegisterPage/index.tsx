import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { createStructuredSelector } from 'reselect';
import { push } from 'react-router-redux';
import SignInUp from 'containers/SignInUp';
import ContentContainer from 'components/ContentContainer';

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 120px;
`;

type Props = {
  locale: string,
  push: (string) => void;
};

class RegisterPage extends React.PureComponent<Props, {}> {

  onSuccess = () => {
    this.props.push('/');
  }

  render() {
    const { locale } = this.props;
    return (
      <StyledContentContainer>
        <SignInUp
          onSignInUpCompleted={this.onSuccess}
          locale={locale}
          show="signUp"
        />
      </StyledContentContainer>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default connect(mapStateToProps, { push })(RegisterPage);

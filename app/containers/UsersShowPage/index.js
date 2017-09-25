/*
 *
 * UsersShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import styled from 'styled-components';
import _ from 'lodash';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectResourceBySlug } from 'utils/resources/selectors';
import { loadUserBySlugRequest } from 'resources/users/actions';
import { loadUserWatcher } from 'resources/users/sagas';
// components
import T from 'components/T';
import HelmetIntl from 'components/HelmetIntl';
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import { Saga } from 'react-redux-saga';
import Avatar from './Avatar';
import messages from './messages';


const StyledContentContainer = styled(ContentContainer)`
  margin-top: 100px;
`;

const InfoContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 100px;
  padding-bottom: 51.6px;
  border-radius: 5px;
  background-color: #ffffff;
`;

const FullNameStyled = styled.div`
  width: 100%;
  padding-top: 115px;
  font-size: 29px;
  font-weight: 500;
  text-align: center;
  color: #000000;
`;

const JoinedAtStyled = styled.div`
  width: 100%;
  margin-top: 10px;
  font-size: 18px;
  text-align: center;
  color: #7e7e7e;
`;

const BioStyled = styled.div`
  width: 551px;
  margin: 23px auto;
  min-height: 165px;
  font-size: 20px;
  font-weight: 300;
  line-height: 1.25;
  text-align: center;
  color: #6b6b6b;
`;

export class UsersShowPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    this.props.loadUserBySlugRequest(this.props.params.slug);
  }

  render() {
    const user = this.props.user && this.props.user.toJS();

    const attributes = user && user.attributes;

    return (
      <StyledContentContainer>
        <Saga saga={loadUserWatcher} />
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {attributes &&
          <div>
            <Avatar avatarURL={attributes.avatar.medium} />
            <InfoContainerStyled>
              <FullNameStyled>{attributes.first_name}&nbsp;{attributes.last_name}</FullNameStyled>
              <JoinedAtStyled>
                <FormattedMessage
                  {...messages.joined}
                  values={{ date: <FormattedDate value={attributes.created_at} /> }}
                />
              </JoinedAtStyled>
              {!_.isEmpty(attributes.bio_multiloc) &&
                <BioStyled>
                  {attributes.bio_multiloc && <T value={attributes.bio_multiloc} />}
                </BioStyled>
              }
            </InfoContainerStyled>
            <IdeaCards filter={{ author: user.id }} />
          </div>
        }
      </StyledContentContainer>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  user: makeSelectResourceBySlug('users', (props) => props.params.slug),
});

const mapDispatchToProps = {
  loadUserBySlugRequest,
};

UsersShowPage.propTypes = {
  user: PropTypes.object,
  loadUserBySlugRequest: PropTypes.func,
  params: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersShowPage);

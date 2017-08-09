import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import styled from 'styled-components';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { FacebookButton, FacebookCount, TwitterButton, TwitterCount } from 'react-social';
import { Icon } from 'semantic-ui-react';

import messages from '../../messages';



type Props = {
  fbAppId: string;
  twAccessToken: string;
  imageUrl: string;
  location: {
    href: string;
  }
};

const Container = styled.div`
  padding: 10px 0;
`;

const TextLine = styled.div`
  display: flex;

`;

const Text = styled.div`
  color: #9b9b9b;
  font-size: 16px;
  flex-grow: 1;
`;

const IconWrapper = styled.div`
  flex: 0 0 20px;
  font-size: 22px;
  cursor: pointer;

  &.fb {
    color: #4D6695;
  }
  &.tw {
    color: #26A0F2;
  }
`;

const Separator = styled.div`
  border: solid #fafafa 1px;
  background: #eaeaea;
  width: 100%;
  height: 3px;
  margin: 10px 0;
`

class SharingLine extends React.Component<Props> {
  render() {
    const { fbAppId, twAccessToken, imageUrl } = this.props;
    const { href } = this.props.location;
    return (
      <Container>
        <TextLine>
          <Text>
            <FormattedMessage {...messages.shareCTA}/>
          </Text>
          <IconWrapper className="fb">
            <FacebookButton url={href} appId={fbAppId} sharer media={imageUrl} >
              <Icon name="facebook official" />
            </FacebookButton>
          </IconWrapper>
          <IconWrapper className="tw">
            <TwitterButton url={href} sharer media={imageUrl} >
              <Icon name="twitter" />
            </TwitterButton>
          </IconWrapper>
        </TextLine>
        <Separator />
      </Container>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  fbAppId: makeSelectSetting(['facebook_login', 'app_id']),
  twAccessToken: makeSelectSetting(['twitter_login', 'access_token']),
});


const mergeProps = (stateProps, dispatchProps, { location, imageUrl }) => ({
  ...stateProps,
  imageUrl,
  location,
});

export default preprocess(mapStateToProps, null, mergeProps)(SharingLine);

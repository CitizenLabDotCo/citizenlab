import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { FacebookButton, FacebookCount, TwitterButton, TwitterCount } from 'react-social';
import { SocialIcon } from 'react-social-icons';
import WithFeature from 'containers/WithFeature';
import { makeSelectSetting } from 'utils/tenant/selectors';

class ShareButtons extends React.PureComponent {
  render() {
    const { appIdFb, appIdTw, image } = this.props;
    const { href } = this.props.location;

    return (<div>
      <WithFeature feature="facebook_login">
        <FacebookButton url={href} appId={appIdFb} sharer media={image} >
          <SocialIcon network="facebook" />
        </FacebookButton>
        <FacebookCount url={href} />
      </WithFeature>
      <WithFeature feature="twitter_login">
        <TwitterButton url={href} appId={appIdTw}>
          <SocialIcon network="twitter" />
        </TwitterButton>
        <TwitterCount url={href} />
      </WithFeature>
    </div>);
  }
}

ShareButtons.propTypes = {
  location: PropTypes.object.isRequired,
  appIdFb: PropTypes.string,
  appIdTw: PropTypes.string,
  image: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  tenantSettings: makeSelectSetting([]),
});


const mergeProps = ({ tenantSettings }, dispatchProps, { location, image }) => ({
  appIdFb: tenantSettings.getIn(['facebook_login', 'app_id']),
  appIdTw: tenantSettings.getIn(['twitter_login', 'access_token']),
  image,
  location,
});

export default preprocess(mapStateToProps, null, mergeProps)(ShareButtons);

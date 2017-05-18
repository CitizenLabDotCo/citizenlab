/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import { store } from 'app';
import OverlayChildren from 'utils/containers/overlayChildren';
import { getAsyncInjectors } from 'utils/asyncInjectors';

import PageView from './pageView';

const { injectReducer } = getAsyncInjectors(store); // eslint-disable-line no-unused-vars


// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasNewPage extends React.Component {
  state = { mainView: true }

  componentDidMount() {
    // Promise.all([
    //   import('containers/SignInPage/reducer'),
    //   import('containers/SignInPage'),
    // ])
    // .then(([reducer, component]) => {
    //   injectReducer('signInPage', reducer.default);
    //   this.setState({ children: component.default });
    // });
  }

  backToMainView = () => this.setState({ mainView: true });
  isMainView = () => this.state.mainView;
  toChildView = () => this.setState({ mainView: false })

  render() {
    let children = null;
    if (this.state.children) {
      children = React.createElement(this.state.children);
    }
    return (
      <div>
      <PageView />
{/*        <OverlayChildren
          component={PageView}
          toChildView={this.toChildView}
          isMainView={this.isMainView}
          handleClose={this.backToMainView}
          {...this.props}
        >
          {children}
        </OverlayChildren>*/}
      </div>
    );
  }
}

IdeasNewPage.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

export default IdeasNewPage ;

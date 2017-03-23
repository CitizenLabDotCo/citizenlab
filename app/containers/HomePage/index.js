/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import TopicSelect from 'components/TopicSelect';
import messages from './messages';

export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    currentTenant: React.PropTypes.any,
  };

  render() {
    const currentTenant = this.props.currentTenant;
    return (
      <div className="cl-home-page">
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <p>CurrentTenant: { currentTenant ? currentTenant.name : 'null' }</p>

        <h3>Topic Select Demo</h3>
        <TopicSelect />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentTenant: state.toJS().persistedData.currentTenant,
});

export default connect(mapStateToProps)(HomePage);

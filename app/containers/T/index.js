/*
 *
 * T
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import _ from 'lodash';
import { findTranslatedText } from './utils';

export class T extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.fallbackUserLocale = 'nl';
    this.fallbackTenantLocales = ['en', 'nl', 'fr'];
  }

  render() {
    const { value, userLocale, tenantLocales } = this.props;

    if (!this.props.value) {
      throw new Error('Must pass a value prop to <T />');
    }

    return (
      <div className="cl-translated-text">
        { findTranslatedText(value, userLocale || this.fallbackUserLocale, tenantLocales || this.fallbackTenantLocales) }
      </div>
    );
  }
}

T.propTypes = {
  value: PropTypes.object,
  userLocale: PropTypes.string,
  tenantLocales: PropTypes.array,
};

// TODO: use selectors
const mapStateToProps = (state) => ({
  userLocale: state.get('persistedData').toJS().userLocale,
  tenantLocales: state.get('persistedData').toJS().tenantLocales,
});

export default connect(mapStateToProps)(T);

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
  render() {
    const { value, userLocale, tenantLocales } = this.props;
    if (!this.props.value) {
      throw new Error('Must pass a value prop to <T />');
    }

    return (
      <div className="cl-translated-text">
        { findTranslatedText(value, userLocale, tenantLocales) }
      </div>
    );
  }
}

T.propTypes = {
  value: PropTypes.object,
  userLocale: PropTypes.string,
  tenantLocales: PropTypes.array,
};

// TODO: remove fake state
const mapStateToProps = () => ({ userLocale: 'si', tenantLocales: ['en', 'nl', 'fr'] });

export default connect(mapStateToProps)(T);

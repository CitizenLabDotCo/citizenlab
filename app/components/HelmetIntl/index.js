/*
 *
 * HelmetIntl
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { injectIntl, intlShape } from 'react-intl';

export class HelmetIntl extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { formatMessage } = this.props.intl;
    const { title, description } = this.props;

    return (
      <div>
        <Helmet
          title={formatMessage(title)}
          meta={[
            { name: 'description', content: formatMessage(description) },
          ]}
        />
      </div>
    );
  }
}

HelmetIntl.propTypes = {
  intl: intlShape.isRequired,
  title: PropTypes.object.isRequired,
  description: PropTypes.object.isRequired,
};


export default injectIntl(HelmetIntl);

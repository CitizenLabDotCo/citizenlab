import React from 'react';
import PropTypes from 'prop-types';
import { parseDate } from '../../lib';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

const PostedAtLabel = ({ createdAt, locale, className }) => (<div className={className}>
  <FormattedMessage {...messages.posted} /> {parseDate(createdAt, locale)}
</div>);

PostedAtLabel.propTypes = {
  createdAt: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default styled(PostedAtLabel)`
  font-size: 12px;
  color: #a7a7a7;
`;


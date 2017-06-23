import React from 'react';
import PropTypes from 'prop-types';
import { parseDate } from '../../lib';
import styled from 'styled-components';

const PostedAtLabel = ({ createdAt, locale, className }) => (<div className={className}>
  {parseDate(createdAt, locale)}
</div>);

PostedAtLabel.propTypes = {
  createdAt: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default styled(PostedAtLabel)`
  TODO
`;


import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';

const LinkContainerStyled = ({ to, className, children }) => (<Link className={className} to={to}>
  {children}
</Link>);

LinkContainerStyled.propTypes = {
  className: PropTypes.string,
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default styled(LinkContainerStyled)`
  color: inherit !important;
`;

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';

const LinkStyled = styled(Link)`
  color: #74C9D2;
`;

const LinkTo = ({ content, link, className }) => (<span className={className}>
  <LinkStyled to={link}>
    {content}
  </LinkStyled>
</span>);

LinkTo.propTypes = {
  content: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default styled(LinkTo)`
  display: inline-block;
  margin-right: 5px; 
`;

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';

const LinkStyled = styled(Link)`
  color: #74C9D2;
  font-weight: bold;
`;

const basePath = '/profile';

const UserMention = ({ fullName, slug, className }) => (<span className={className}>
  <LinkStyled to={`${basePath}/${slug}`}>
    {fullName}
  </LinkStyled>
</span>);

UserMention.propTypes = {
  fullName: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default styled(UserMention)`
  display: inline-block;
  margin-right: 5px; 
`;

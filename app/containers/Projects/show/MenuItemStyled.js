import React from 'react';
import { Menu } from 'semantic-ui-react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

const MenuItemStyled = ({ title, to, active, className, key }) => (<Menu.Item
  key={key}
  className={className}
  name={title}
  as={Link}
  to={to}
  active={active}
/>);

MenuItemStyled.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

// TODO: test this with FF / Opera / IE: and eventually adjust based on https://css-tricks.com/line-clampin/ + https://codepen.io/siiron/pen/jfBhy/
export default styled(MenuItemStyled)`
  width: 20%;
  text-overflow: ellipsis;
  padding: 14px !important;
  height: 1em;
  overflow: hidden;
  margin: 0 auto !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  border-color: ${(props) => props.active ? `${props.theme.accentFg} !important` : '#fff'};
  text-align: center;
`;

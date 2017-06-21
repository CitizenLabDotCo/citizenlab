import React from 'react';
import { Menu } from 'semantic-ui-react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

const MenuItemStyled = ({ title, to, active, className }) => (<Menu.Item
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
  width: ${(props) => props.isProject ? '20%' : '10%'};
  text-overflow: ellipsis;
  padding: 14px !important;
  height: 1em;
  overflow: hidden;
  margin: 0 auto !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  opacity: ${(props) => props.active ? 'inherit' : '0.6'};
  border-color: ${(props) => props.active ? `${props.theme.accentFg} !important` : '#fff'};
  color: #232f45 !important;
  border-bottom-color: ${(props) => props.active ? '#6080ad !important' : 'inherit'};
  background-color: #ffffff !important;
  text-align: center;
  margin-bottom: 2px !important;
`;

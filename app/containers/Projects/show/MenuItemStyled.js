import React from 'react';
import { Menu } from 'semantic-ui-react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

const MenuItemWrapperStyled = styled.div`
  width: ${(props) => props.isProject ? '20%' : '10%'};
  padding: 14px !important;
  margin-right: 55px;
  overflow: hidden;
`;

const MenuItemStyled = ({ title, to, active, className, isProject }) => (<MenuItemWrapperStyled isProject={isProject}><Menu.Item
  className={className}
  name={title}
  as={Link}
  to={to}
  active={active}
/></MenuItemWrapperStyled>);

MenuItemStyled.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  className: PropTypes.string,
  isProject: PropTypes.bool,
};

export default styled(MenuItemStyled)`
  opacity: ${(props) => props.active ? 'inherit' : '0.6'};
  color: #232f45 !important;
  background-color: #ffffff !important;
  border-bottom-color: ${(props) => props.theme.main};
  text-align: center;
  white-space: nowrap;
  display: block !important;
  text-overflow: ellipsis;
  overflow: hidden;
`;

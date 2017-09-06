import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Image, Menu } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';

import messages from './messages';
import styled from 'styled-components';

// icons
import dashboardIcon from './icons/dashboard.svg';
import usersIcon from './icons/users.svg';
// import groupsIcon from './icons/groups.svg';
import projectsIcon from './icons/projects.svg';
import ideasIcon from './icons/ideas.svg';
import settingsIcon from './icons/settings.svg';
// import needHelpIcon from './icons/need_help_icon.svg';

const MenuStyled = styled(Menu)`
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 1;
  margin-top: -69px;
  background-color: #3b3b3b !important;
  padding-top: 30px;
  border-radius: 0 !important;
`;

const MenuItemContainerStyled = styled.div`
  opacity: ${(props) => props.active ? '1.0' : '0.6'};
  background-color: ${(props) => props.active ? '#232323' : 'inherit'};

  // contained child
  > a:after {
    width: 12px;
    height: 12px;
    transform: rotate(-315deg);
    background-color: #f2f2f2;
    content: '';
    position: relative;
    margin-top: -15px;
    display: ${(props) => props.active ? 'block' : 'none'};
    margin-left: calc(100% + 16px)
  }
`;

const MenuItemStyled = styled(Menu.Item)`
  color: #ffffff !important;
  background-color: inherit !important;
  font-size: 17px;
  font-weight: bold;
  text-align: left;
  margin-left: 20px;
`;

const MenuItemIcon = (icon) => (<Image
  src={icon}
  style={{
    width: '20px',
    height: '20px',
    display: 'inline-block',
    marginTop: '-5px',
    marginRight: '14px',
  }}
/>);

// const NeedHelpBoxStyled = styled.div`
//   height: 110px;
//   width: 209px;
//   position: fixed;
//   bottom: 0;
//   background-color: #464646;
//   display:flex;
//   justify-content: center;
//   align-items: center;
// `;

// const HelpTextStyled = styled.div`
//   padding-left: 1rem;
// `;

// const HelpImageStyled = styled(Image)`
//   width: 34.6px;
//   height: 37.2px;
// `;

// const NeedHelpLabelStyled = styled.div`
//   font-size: 16px;
//   text-align: left;
//   color: #ffffff;
// `;

// const ReadOurGuide = styled(Link)`
//   font-size: 16px;
//   text-align: left;
//   color: #ffffff !important;
//   font-weight: bold;
//   text-decoration: underline !important;
// `;

function Sidebar(props) {
  const { formatMessage } = props.intl;

  return (
    <MenuStyled vertical borderless>
      <MenuItemContainerStyled active={props.location.pathname === '/admin'}>
        <MenuItemStyled icon={MenuItemIcon(dashboardIcon)} name={formatMessage({ ...messages.dashboard })} content={formatMessage({ ...messages.dashboard })} as={Link} to="/admin" />
      </MenuItemContainerStyled>
      <MenuItemContainerStyled active={props.location.pathname === '/admin/users'}>
        <MenuItemStyled icon={MenuItemIcon(usersIcon)} name={formatMessage({ ...messages.users })} content={formatMessage({ ...messages.users })} as={Link} to="/admin/users" />
      </MenuItemContainerStyled>
      {/* <MenuItemContainerStyled active={props.location.pathname === '/admin/groups'}>
        <MenuItemStyled icon={MenuItemIcon(groupsIcon)} name={formatMessage({ ...messages.groups })} as={Link} to="/admin/groups" />
      </MenuItemContainerStyled> */}
      <MenuItemContainerStyled active={props.location.pathname === '/admin/projects'}>
        <MenuItemStyled icon={MenuItemIcon(projectsIcon)} name={formatMessage({ ...messages.projects })} content={formatMessage({ ...messages.projects })} as={Link} to="/admin/projects" />
      </MenuItemContainerStyled>
      <MenuItemContainerStyled active={props.location.pathname === '/admin/ideas'}>
        <MenuItemStyled icon={MenuItemIcon(ideasIcon)} name={formatMessage({ ...messages.ideas })} content={formatMessage({ ...messages.ideas })} as={Link} to="/admin/ideas" />
      </MenuItemContainerStyled>
      <MenuItemContainerStyled active={props.location.pathname === '/admin/settings'}>
        <MenuItemStyled icon={MenuItemIcon(settingsIcon)} name={formatMessage({ ...messages.settings })} content={formatMessage({ ...messages.settings })} as={Link} to="/admin/settings" />
      </MenuItemContainerStyled>
      {/* <NeedHelpBoxStyled>
        <HelpImageStyled
          src={needHelpIcon}
        />
        <HelpTextStyled>
          <NeedHelpLabelStyled>
            <FormattedMessage {...messages.needHelp} /></NeedHelpLabelStyled>
          <ReadOurGuide to="/admin/guide">
            <FormattedMessage {...messages.readGuide} />
          </ReadOurGuide>
        </HelpTextStyled>
      </NeedHelpBoxStyled> */}
    </MenuStyled>
  );
}

Sidebar.propTypes = {
  location: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(Sidebar);

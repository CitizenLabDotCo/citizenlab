import React, { memo, useState, useCallback, useEffect } from 'react';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { insertConfiguration } from 'utils/moduleUtils';
import { InsertConfigurationOptions } from 'typings';
// components
import Outlet from 'components/Outlet';
import { Icon } from '@citizenlab/cl2-component-library';
import AdminProjectsProjectGeneral from 'containers/Admin/projects/project/general';
import { HeaderTitle } from './StyledComponents';
import Tabs, { ITabItem } from 'components/UI/Tabs';

// utils
import eventEmitter from 'utils/eventEmitter';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// style
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';
import { transparentize } from 'polished';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

const duartion = 350;
const easing = 'cubic-bezier(0.19, 1, 0.22, 1)';

const Container = styled.div`
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.divider};
`;

const CreateProjectContent = styled.div`
  width: 100%;
  opacity: 0;
  display: none;
  transition: all ${duartion}ms ${easing};
  will-change: opacity, height;

  &.content-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.content-enter-active {
      opacity: 1;
      max-height: 635px;
      overflow: hidden;
      display: block;
    }
  }

  &.content-enter-done {
    opacity: 1;
    max-height: auto;
    overflow: visible;
    display: block;
  }

  &.content-exit {
    opacity: 1;
    max-height: 635px;
    overflow: hidden;
    display: block;

    &.content-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.content-exit-done {
    display: none;
    max-height: auto;
  }
`;

const CreateProjectContentInner = styled.div`
  padding-left: 4rem;
  padding-right: 4rem;
  padding-top: 0.5rem;
  padding-bottom: 2.8rem;
`;

const Expand = styled.div`
  display: flex;
  align-items: center;
`;

const ExpandIconWrapper = styled.div`
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px ${transparentize(0.7, colors.textSecondary)};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease-out;
`;

const ExpandIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  transition: all ${duartion - 100}ms ease-out;

  &.expanded {
    transform: rotate(90deg);
  }
`;

const CreateProjectButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  padding-left: 4rem;
  padding-right: 4rem;
  padding-top: 30px;
  padding-bottom: 30px;
  margin: 0;
  cursor: pointer;

  &:hover {
    ${ExpandIconWrapper} {
      border-color: ${transparentize(0.2, colors.textSecondary)};
    }
  }
`;

const StyledTabs = styled(Tabs)`
  margin-bottom: 25px;
`;

export interface INewProjectCreatedEvent {
  projectId?: string;
}

interface Props {
  className?: string;
}

export interface ITabNamesMap {
  scratch: 'scratch';
}

export type TTabName = ITabNamesMap[keyof ITabNamesMap];

const CreateProject = memo<Props & WrappedComponentProps>(
  ({ className, intl: { formatMessage } }) => {
    const [tabs, setTabs] = useState<ITabItem[]>([
      {
        name: 'scratch',
        label: formatMessage(messages.fromScratch),
        icon: 'blank-paper',
      },
    ]);
    const tabValues = tabs.map((tab) => tab.name) as TTabName[];

    const [selectedTabValue, setSelectedTabValue] =
      useState<TTabName>('scratch');
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      // when inserting tabs, always reset the default selected tab
      // to the first tab
      setSelectedTabValue(tabValues[0]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabs]);

    useEffect(() => {
      const subscription = eventEmitter
        .observeEvent<INewProjectCreatedEvent>('NewProjectCreated')
        .subscribe(({ eventValue }) => {
          const projectId = eventValue?.projectId;

          if (projectId) {
            setTimeout(() => {
              clHistory.push({
                pathname: adminProjectsProjectPath(projectId),
              });
            }, 1000);
          }
        });

      return () => subscription.unsubscribe();
    }, []);

    const handleExpandCollapse = useCallback(() => {
      if (expanded) {
        trackEventByName(tracks.createProjectSectionCollapsed);
      } else {
        trackEventByName(tracks.createProjectSectionExpanded);
      }

      console.log('expanding');
      setExpanded(!expanded);
    }, [expanded]);

    const handleTabOnClick = useCallback(
      (newSelectedTabValue: TTabName) => {
        trackEventByName(tracks.createdProject, {
          selectedTabValue,
        });
        setSelectedTabValue(newSelectedTabValue);
      },
      [selectedTabValue]
    );

    const handleData = (data: InsertConfigurationOptions<ITabItem>) =>
      setTabs((tabs) => {
        console.log('setting tabs');
        return insertConfiguration(data)(tabs);
      });

    return (
      <Container className={className}>
        <Outlet
          id="app.containers.Admin.projects.all.createProject.tabs"
          onData={handleData}
        />
        <CreateProjectButton
          className={`e2e-create-project-expand-collapse-button ${
            expanded ? 'expanded' : 'collapsed'
          }`}
          aria-label={formatMessage(messages.createAProjectFromATemplate)}
          onMouseDown={removeFocusAfterMouseClick}
          onClick={handleExpandCollapse}
        >
          <HeaderTitle>
            <FormattedMessage {...messages.createAProject} />
          </HeaderTitle>
          <Expand>
            <ExpandIconWrapper>
              <ExpandIcon
                name="chevron-right"
                className={expanded ? 'expanded' : 'collapsed'}
              />
            </ExpandIconWrapper>
          </Expand>
        </CreateProjectButton>
        <CSSTransition
          classNames="content"
          in={expanded}
          timeout={duartion}
          mounOnEnter={true}
          unmountOnExit={true}
          enter={true}
        >
          <CreateProjectContent
            className={`${expanded ? 'expanded' : 'collapsed'}`}
          >
            <CreateProjectContentInner>
              {tabs.length > 1 && (
                <StyledTabs
                  className="e2e-create-project-tabs"
                  items={tabs}
                  selectedValue={selectedTabValue}
                  onClick={handleTabOnClick}
                />
              )}
              <Outlet
                id="app.containers.Admin.projects.all.createProject"
                selectedTabValue={selectedTabValue}
              />
              {selectedTabValue === 'scratch' && (
                <AdminProjectsProjectGeneral />
              )}
            </CreateProjectContentInner>
          </CreateProjectContent>
        </CSSTransition>
      </Container>
    );
  }
);

export default injectIntl(CreateProject);

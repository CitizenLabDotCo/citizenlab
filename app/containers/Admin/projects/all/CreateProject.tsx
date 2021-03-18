import React, {
  memo,
  useState,
  useCallback,
  useEffect,
  useRef,
  MouseEvent,
} from 'react';
import { get } from 'lodash-es';
import clHistory from 'utils/cl-router/history';

// components
import { Icon } from 'cl2-component-library';
import Tabs, { ITabItem } from 'components/UI/Tabs';
import ProjectTemplatesContainer from './ProjectTemplatesContainer';
import AdminProjectEditGeneral from 'containers/Admin/projects/edit/general';
import { HeaderTitle } from './StyledComponents';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// utils
import eventEmitter from 'utils/eventEmitter';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
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
  border: 1px solid ${({ theme }) => theme.colors.separation};
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
  border: solid 1px ${transparentize(0.7, colors.label)};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease-out;
`;

const ExpandIcon = styled(Icon)`
  height: 11px;
  fill: ${colors.label};
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
      border-color: ${transparentize(0.2, colors.label)};
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

const CreateProject = memo<Props & InjectedIntlProps>(({ className, intl }) => {
  const tabs: ITabItem[] = [
    {
      value: 'template',
      label: intl.formatMessage(messages.fromATemplate),
      icon: 'template',
    },
    {
      value: 'scratch',
      label: intl.formatMessage(messages.fromScratch),
      icon: 'scratch',
    },
  ];

  const tenant = useAppConfiguration();
  const projectTemplatesEnabled: boolean = get(
    tenant,
    'data.attributes.settings.admin_project_templates.enabled',
    false
  );

  const [expanded, setExpanded] = useState(false);
  const [selectedTabValue, setSelectedTabValue] = useState(tabs[0].value);

  const isFirstRun = useRef(true);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent<INewProjectCreatedEvent>('NewProjectCreated')
      .subscribe(({ eventValue }) => {
        const projectId = eventValue?.projectId;

        if (projectId) {
          setTimeout(() => {
            clHistory.push({
              pathname: `/admin/projects/${projectId}/edit`,
            });
          }, 1000);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const handleExpandCollapse = useCallback(() => {
    if (expanded) {
      trackEventByName(tracks.createProjectSectionCollapsed);
    } else {
      trackEventByName(tracks.createProjectSectionExpanded);
    }

    setExpanded(!expanded);
  }, [expanded]);

  const handleTabOnClick = useCallback(
    (newSelectedTabValue: string) => {
      setSelectedTabValue(newSelectedTabValue);
    },
    [selectedTabValue]
  );

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (selectedTabValue === 'template') {
      trackEventByName(tracks.createProjectFromTemplateTabSelected);
    } else if (selectedTabValue === 'scratch') {
      trackEventByName(tracks.createProjectFromScratchTabSelected);
    }
  }, [selectedTabValue]);

  return (
    <Container className={className}>
      <CreateProjectButton
        className={`e2e-create-project-expand-collapse-button ${
          expanded ? 'expanded' : 'collapsed'
        }`}
        aria-label={intl.formatMessage(messages.createAProjectFromATemplate)}
        onMouseDown={removeFocus}
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
            {projectTemplatesEnabled ? (
              <>
                <StyledTabs
                  className="e2e-create-project-tabs"
                  items={tabs}
                  selectedValue={selectedTabValue}
                  onClick={handleTabOnClick}
                />
                {selectedTabValue === 'template' ? (
                  <ProjectTemplatesContainer />
                ) : (
                  <AdminProjectEditGeneral />
                )}
              </>
            ) : (
              <AdminProjectEditGeneral />
            )}
          </CreateProjectContentInner>
        </CreateProjectContent>
      </CSSTransition>
    </Container>
  );
});

export default injectIntl(CreateProject);

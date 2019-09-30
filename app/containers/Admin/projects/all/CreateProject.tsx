import React, { memo, useState, useCallback, useEffect, MouseEvent } from 'react';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// graphql
import { useQuery } from '@apollo/react-hooks';

// components
import Icon from 'components/UI/Icon';
import Tabs, { ITabItem } from 'components/UI/Tabs';
import ProjectTemplateCards, { TEMPLATES_QUERY } from './ProjectTemplateCards';
import AdminProjectEditGeneral  from 'containers/Admin/projects/edit/general';
import { HeaderTitle } from './styles';

// hooks
import useTenant from 'hooks/useTenant';

// utils
import eventEmitter from 'utils/eventEmitter';

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

interface Props {
  className?: string;
}

const CreateProject = memo<Props & InjectedIntlProps>(({ className, intl }) => {

  const fromATemplateText = intl.formatMessage(messages.fromATemplate);
  const fromScratchText = intl.formatMessage(messages.fromScratch);
  const items: ITabItem[] = [{
    name: fromATemplateText,
    icon: 'template'
  }, {
    name: fromScratchText,
    icon: 'scratch'
  }];

  const tenant = useTenant();
  const locales = !isNilOrError(tenant) ? tenant.data.attributes.settings.core.locales : null;
  const organizationTypes = !isNilOrError(tenant) ? tenant.data.attributes.settings.core.organization_type : null;
  const projectTemplatesEnabled: boolean = get(tenant, 'data.attributes.settings.admin_project_templates.enabled', false);

  const [expanded, setExpanded] = useState(false);
  const [hasCollapseAnimation, setHasCollapseAnimation] = useState(true);
  const [selectedTab, setSelectedTab] = useState(fromATemplateText);

  // prefetch templates query used in ProjectTemplateCards so the data is
  // already loaded when expanding the 'create project' section
  useQuery(TEMPLATES_QUERY, {
    variables: {
      locales,
      organizationTypes,
      departments: null,
      purposes: null,
      participationLevels: null,
      search: null,
      cursor: null,
    },
  });

  useEffect(() => {
    const subscription = eventEmitter.observeEvent('NewProjectCreated').subscribe(() => {
      setHasCollapseAnimation(false);
      setTimeout(() => setExpanded(false), 100);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 200);
      setTimeout(() => setHasCollapseAnimation(true), 500);
    });

    return () => subscription.unsubscribe();
  }, []);

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const handleExpandCollapse = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const handleTabOnClick = useCallback((item: string) => {
    setSelectedTab(item);
  }, []);

  return (
    <Container className={className}>
      <CreateProjectButton
        className={expanded ? 'expanded' : 'collapsed'}
        aria-label="create a project from a template"
        onMouseDown={removeFocus}
        onClick={handleExpandCollapse}
      >
        <HeaderTitle>
          <FormattedMessage {...messages.createAProject} />
        </HeaderTitle>
        <Expand>
          <ExpandIconWrapper>
            <ExpandIcon name="chevron-right" className={expanded ? 'expanded' : 'collapsed'} />
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
        exit={hasCollapseAnimation}
      >
        <CreateProjectContent className={`${expanded ? 'expanded' : 'collapsed'}`}>
          <CreateProjectContentInner>
            {projectTemplatesEnabled ? (
              <>
                <StyledTabs
                  items={items}
                  selectedItemName={selectedTab}
                  onClick={handleTabOnClick}
                />
                {selectedTab === fromATemplateText ? <ProjectTemplateCards /> : <AdminProjectEditGeneral />}
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

import React, { memo, useState, useCallback, useEffect, MouseEvent } from 'react';

// components
import Icon from 'components/UI/Icon';
import Tabs, { ITabItem } from 'components/UI/Tabs';
import ProjectTemplateCards from './ProjectTemplateCards';
import AdminProjectEditGeneral  from 'containers/Admin/projects/edit/general';
import { HeaderTitle } from './styles';

// Events
import eventEmitter from 'utils/eventEmitter';

// localisation
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';
import { darken } from 'polished';

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

// const ExpandText = styled.div`
//   color: ${colors.label};
//   font-size: ${fontSizes.base}px;
//   font-weight: 500;
//   margin-right: 10px;
// `;

const ExpandIconWrapper = styled.div`
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 2px ${colors.separation};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease-out;
`;

const ExpandIcon = styled(Icon)`
  height: 10px;
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
  padding-top: 35px;
  padding-bottom: 35px;
  margin: 0;
  cursor: pointer;

  &:hover {
    ${ExpandIconWrapper} {
      border-color:${darken(0.25, colors.separation)};
    }
  }
`;

const StyledTabs = styled(Tabs)`
  margin-bottom: 20px;
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

  const [expanded, setExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState(fromATemplateText);

  useEffect(() => {
    const subscription = eventEmitter.observeEvent('NewProjectCreated').subscribe(() => {
      setExpanded(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    return () => subscription.unsubscribe();
  }, []);

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const handleExpandCollapse = useCallback(() => {
    setExpanded(!expanded);

    // if (expanded) {
    //   setTimeout(() => {
    //     setSelectedTab(fromATemplateText);
    //   }, expandAnimationDuration);
    // }
  }, [expanded]);

  const handleTabOnClick = useCallback((item: string) => {
    setSelectedTab(item);
  }, [expanded]);

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
          {/*
          <ExpandText>
            {expanded ? <FormattedMessage {...messages.collapse} /> : <FormattedMessage {...messages.expand} />}
          </ExpandText>
          */}
          <ExpandIconWrapper>
            <ExpandIcon name="chevron-right" className={expanded ? 'expanded' : 'collapsed'} />
          </ExpandIconWrapper>
        </Expand>
      </CreateProjectButton>
      <CSSTransition
        classNames="content"
        in={expanded}
        timeout={duartion}
        mounOnEnter={false}
        unmountOnExit={false}
        enter={true}
        exit={true}
      >
        <CreateProjectContent className={`${expanded ? 'expanded' : 'collapsed'}`}>
          <CreateProjectContentInner>
            <StyledTabs
              items={items}
              selectedItemName={selectedTab}
              onClick={handleTabOnClick}
            />
            {selectedTab === fromATemplateText ? <ProjectTemplateCards /> : <AdminProjectEditGeneral />}
            {/* <ProjectTemplates /> */}
          </CreateProjectContentInner>
        </CreateProjectContent>
      </CSSTransition>
    </Container>
  );
});

export default injectIntl(CreateProject);

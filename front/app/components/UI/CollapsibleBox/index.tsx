import React, { memo, useCallback, useState, Suspense } from 'react';

// components
import { Icon, IconNames } from '@citizenlab/cl2-component-library';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

const timeout = 300;

const Container = styled.div`
  background: #fff;
  border: 1px solid ${colors.separation};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
`;

const TitleIcon = styled(Icon)`
  flex: 0 0 16px;
  width: 16px;
  height: 23px;
  fill: ${colors.label};
  margin-right: 13px;

  ${media.smallerThanMinTablet`
    flex: 0 0 14px;
    width: 14px;
    height: 20px;
  `}
`;

const ContentLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-right: 6px;
  text-align: left;
  transition: all 100ms ease-out;
`;

const ContentToggleButton = styled.button`
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding-left: 18px;
  padding-right: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: 24px;
  font-weight: 600;
  border-radius: ${(props: any) => props.theme.borderRadius};

  &:hover {
    ${ContentLabel} {
      color: ${darken(0.2, colors.label)};
    }
  }
`;

const ArrowIcon = styled(Icon)`
  flex: 0 0 13px;
  width: 13px;
  height: 13px;
  fill: ${colors.label};
  transform: rotate(90deg);
  transition: all 0.2s linear;

  &.open {
    transform: rotate(0deg);
  }
`;

const Wrapper = styled.div<{ contentBackgroundColor?: string }>`
  position: relative;
  overflow: hidden;
  z-index: 2;
  padding: 20px;
  background-color: ${(props) => props.contentBackgroundColor || '#fff'};
  margin-top: 1px;

  ${media.largePhone`
    padding: 30px 20px;
  `}

  &.content-enter {
    height: 0;
    opacity: 0;

    &.content-enter-active {
      height: 100%;
      opacity: 1;
      transition: all ${timeout}ms ease-out;
    }
  }

  &.content-exit {
    height: 100%;
    opacity: 1;

    &.content-exit-active {
      height: 0;
      opacity: 0;
      transition: all ${timeout}ms ease-out;
    }
  }
`;

export interface Props {
  className?: string;
  titleIconName?: IconNames;
  title: string | JSX.Element;
  contentBackgroundColor?: string;
  e2eId?: string;
  /* children should be lazy-loaded. Search code for examples */
  children: React.ReactNode;
}

const CollapsibleBox = memo<Props>((props) => {
  const [showContent, setShowContent] = useState<boolean>(false);

  const handleContentToggle = useCallback(() => {
    setShowContent(!showContent);
  }, [showContent]);

  const {
    className,
    titleIconName,
    title,
    children,
    contentBackgroundColor,
    e2eId,
  } = props;

  return (
    <Container className={className}>
      <ContentToggleButton
        id={e2eId}
        aria-expanded={showContent}
        onClick={handleContentToggle}
      >
        <Title>
          {titleIconName && <TitleIcon name={titleIconName} />}
          <ContentLabel>{title}</ContentLabel>
        </Title>
        <ArrowIcon name="dropdown" className={showContent ? 'open' : ''} />
      </ContentToggleButton>
      <CSSTransition
        classNames="content"
        in={showContent}
        timeout={timeout}
        mountOnEnter={true}
        unmountOnExit={true}
        exit={true}
      >
        <Wrapper contentBackgroundColor={contentBackgroundColor}>
          <Suspense fallback={null}>{children}</Suspense>
        </Wrapper>
      </CSSTransition>
    </Container>
  );
});

export default CollapsibleBox;

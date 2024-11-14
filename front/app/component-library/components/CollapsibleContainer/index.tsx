import React, { ReactNode, useState } from 'react';

import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import useInstanceId from '../../hooks/useInstanceId';
import { isRtl } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';
import Icon from '../Icon';
import Title, { TitleProps } from '../Title';

const ANIMATION_TIMEOUT = 100;
const ANIMATION_SPEED_IN = 200;
const ANIMATION_SPEED_OUT = 10000;

const ChevronIcon = styled(Icon)`
  transition: fill 80ms ease-out, transform 200ms ease-out;
`;

const TitleButton = styled.button`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;

  &.expanded {
    ${ChevronIcon} {
      transform: rotate(90deg);
    }
  }
  &:hover {
    ${ChevronIcon} {
      fill: #000;
    }
  }

  &:focus-visible {
    outline: 2px solid black;
    border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  }

  ${isRtl`
    text-align: right;
    direction: rtl;
    ${ChevronIcon} {
        transform: rotate(180deg);
    }
  `}
`;

const CollapseContainer = styled(Box)`
  max-height: 1500px;
  will-change: opacity, height;

  ${isRtl`
    text-align: right;
    direction: rtl;
`}

  &.expanded-enter {
    opacity: 0;
    height: 0px;
  }

  &.expanded-enter-active {
    opacity: 1;
    height: 100%;
    transition: max-height ${ANIMATION_SPEED_IN}ms,
      opacity ${ANIMATION_SPEED_IN}ms;
  }

  &.expanded-exit {
    opacity: 1;
    height: 100%;
  }

  &.expanded-exit-active {
    opacity: 0;
    height: 0px;
    transition: max-height ${ANIMATION_SPEED_OUT}ms,
      opacity ${ANIMATION_SPEED_OUT}ms;
  }
`;

type CollapsibleContainerTitleProps = {
  titleVariant: TitleProps['variant'];
  titleFontSize?: TitleProps['fontSize'];
  titlePadding?: TitleProps['padding'];
  titleFontWeight?: TitleProps['fontWeight'];
  titleAs: TitleProps['as'];
};

type CollapsibleContainerProps = {
  children: ReactNode;
  title: ReactNode;
  isOpenByDefault?: boolean;
  useRegionRole?: boolean;
} & BoxProps &
  CollapsibleContainerTitleProps;

const CollapsibleContainer = ({
  isOpenByDefault = false,
  title,
  children,
  titleVariant,
  titlePadding,
  titleFontSize,
  titleFontWeight,
  titleAs,
  useRegionRole,
  ...boxProps
}: CollapsibleContainerProps) => {
  const [isExpanded, setIsExpanded] = useState(isOpenByDefault);
  const uuid = useInstanceId();

  const handleChange = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box {...boxProps}>
      <Title
        as={titleAs}
        variant={titleVariant}
        fontSize={titleFontSize}
        m="0px"
        // mb is needed to ensure we can see the border of TitleButton when it's focused
        mb="2px"
        p={titlePadding || '0px'}
      >
        <TitleButton
          aria-expanded={isExpanded}
          aria-controls={`collapsed-section-${uuid}`}
          id={`collapse-container-title-${uuid}`}
          className={isExpanded ? 'expanded' : 'collapsed'}
          onClick={handleChange}
        >
          <span style={{ fontWeight: titleFontWeight }}>{title}</span>
          <ChevronIcon name="chevron-right" />
        </TitleButton>
      </Title>
      <Box
        role={useRegionRole ? 'region' : undefined}
        aria-live="polite"
        id={`collapsed-section-${uuid}`}
        aria-labelledby={`collapse-container-title-${uuid}`}
      >
        <CSSTransition
          in={isExpanded}
          timeout={ANIMATION_TIMEOUT}
          mountOnEnter={true}
          unmountOnExit={true}
          classNames={`expanded`}
        >
          <CollapseContainer>{children}</CollapseContainer>
        </CSSTransition>
      </Box>
    </Box>
  );
};

export default CollapsibleContainer;

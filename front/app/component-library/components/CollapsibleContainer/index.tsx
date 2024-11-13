import React, { ReactNode, useState } from 'react';

import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import useInstanceId from '../../hooks/useInstanceId';
import { isRtl } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';
import Icon from '../Icon';
import Title, { TitleProps } from '../Title';

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

  &:focus {
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
  opacity: 1;
  transition: 'all 1000ms cubic-bezier(0.165, 0.84, 0.44, 1)';
  will-change: opacity, height;

  ${isRtl`
    text-align: right;
    direction: rtl;
`}

  &.expanded-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;

    &.expanded-enter-active {
      opacity: 1;
      max-height: 1500px;
      overflow: hidden;
    }
  }

  &.expanded-enter-done {
    opacity: 1;
    overflow: visible;
  }

  &.expanded-exit {
    opacity: 1;
    max-height: 1500px;
    overflow: hidden;

    &.collapsed-exit-active {
      opacity: 0;
      max-height: 1500px;
      overflow: hidden;
    }
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
        hidden={!isExpanded}
      >
        <CSSTransition
          in={isExpanded}
          timeout={1500}
          mountOnEnter={true}
          unmountOnExit={true}
          exit={false}
          classNames={`expanded`}
        >
          <CollapseContainer aria-live="polite">
            <Box>{children}</Box>
          </CollapseContainer>
        </CSSTransition>
      </Box>
    </Box>
  );
};

export default CollapsibleContainer;

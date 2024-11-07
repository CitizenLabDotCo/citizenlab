import React, { ReactNode, useState } from 'react';

import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import useInstanceId from '../../hooks/useInstanceId';
import { isRtl } from '../../utils/styleUtils';
import Box, {
  BoxMarginProps,
  BoxPaddingProps,
  BoxProps,
  BoxWidthProps,
} from '../Box';
import Icon from '../Icon';

type CollapsibleContainerProps = {
  children: ReactNode;
  title: ReactNode;
  isOpenByDefault?: boolean;
} & BoxMarginProps &
  BoxWidthProps &
  BoxPaddingProps;

const ChevronIcon = styled(Icon)`
  transition: fill 80ms ease-out, transform 200ms ease-out;
`;

const TitleButton = styled(Box)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  width: 100%;
  text-align: left;
  ${isRtl`
    text-align: right;
    direction: rtl;
    ${ChevronIcon} {
        transform: rotate(180deg);
    }
`}
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
`;

const CollapseContainer = styled(Box)`
  opacity: 1;
  display: flex;
  flex-wrap: wrap;
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

const CollapsibleContainer = ({
  isOpenByDefault,
  title,
  children,
  ...rest
}: CollapsibleContainerProps & BoxProps) => {
  const [isExpanded, setIsExpanded] = useState(isOpenByDefault);
  const uuid = useInstanceId();

  const handleChange = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box display="flex" flexDirection="column" {...rest}>
      <Box display="flex" alignItems="center">
        <TitleButton
          as="button"
          aria-expanded={isExpanded}
          aria-controls={`collapsed-section-${uuid}`}
          id={`collapse-container-title-${uuid}`}
          className={isExpanded ? 'expanded' : 'collapsed'}
          onClick={handleChange}
        >
          {title}
          <ChevronIcon name="chevron-right" />
        </TitleButton>
      </Box>
      <Box
        role="region"
        aria-live="polite"
        id={`collapsed-section-${uuid}`}
        aria-labelledby={`collapse-container-title-${uuid}`}
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
            <Box width="100%">{children}</Box>
          </CollapseContainer>
        </CSSTransition>
      </Box>
    </Box>
  );
};

export default CollapsibleContainer;

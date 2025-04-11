import React, { ReactNode, useState } from 'react';

import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import useInstanceId from '../../hooks/useInstanceId';
import { colors, isRtl } from '../../utils/styleUtils';
import Box, {
  BoxBorderProps,
  BoxMarginProps,
  BoxPaddingProps,
  BoxWidthProps,
} from '../Box';
import Icon from '../Icon';
import ListItem from '../ListItem';

type AccordionProps = {
  title: ReactNode;
  children: ReactNode;
  prefix?: ReactNode;
  isOpenByDefault?: boolean;
  className?: string;
  onChange?: (isOpen: boolean) => void;
  timeoutMilliseconds?: number;
  transitionHeightPx?: number;
} & BoxMarginProps &
  BoxWidthProps &
  BoxPaddingProps &
  BoxBorderProps;

const ChevronIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-left: 20px;
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

const CollapseContainer = styled(Box)<{
  timeout: number;
  transitionHeight: number;
}>`
  padding-top: 12px;
  margin-bottom: 24px;
  opacity: 1;
  display: flex;
  flex-wrap: wrap;
  transition: ${(props) =>
    `all ${props.timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1)`};
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
      max-height: ${(props) => `${props.transitionHeight}px`};
      overflow: hidden;
    }
  }

  &.expanded-enter-done {
    opacity: 1;
    overflow: visible;
  }

  &.expanded-exit {
    opacity: 1;
    max-height: ${(props) => `${props.transitionHeight}px`};
    overflow: hidden;

    &.collapsed-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
    }
  }
`;

const Accordion = ({
  isOpenByDefault,
  title,
  prefix,
  className,
  onChange,
  children,
  timeoutMilliseconds = 1500,
  transitionHeightPx = 600,
  ...rest
}: AccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(isOpenByDefault);
  const uuid = useInstanceId();

  const handleChange = () => {
    setIsExpanded(!isExpanded);
    onChange && onChange(!isExpanded);
  };

  return (
    // In the future, ideally use the CollapsibleContainer component here insetad.
    <ListItem className={className} {...rest}>
      <Box display="flex" alignItems="center">
        {prefix}
        <TitleButton
          as="button"
          padding="0"
          aria-expanded={isExpanded}
          aria-controls={`collapsed-section-${uuid}`}
          id={`accordion-title-${uuid}`}
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
        aria-labelledby={`accordion-title-${uuid}`}
      >
        <CSSTransition
          in={isExpanded}
          timeout={timeoutMilliseconds}
          mountOnEnter={true}
          unmountOnExit={true}
          exit={false}
          classNames={`expanded`}
        >
          <CollapseContainer
            aria-live="polite"
            transitionHeight={transitionHeightPx}
            timeout={timeoutMilliseconds}
          >
            {children}
          </CollapseContainer>
        </CSSTransition>
      </Box>
    </ListItem>
  );
};

export default Accordion;

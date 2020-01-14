import React, { memo, useCallback, useState } from 'react';

// components
import Icon from 'components/UI/Icon';
import TipsContent from './TipsContent';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  background: #fff;
  border: 1px solid ${colors.separation};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const TipsLabel = styled.div`
  margin-right: 6px;
  text-align: left;
  transition: all 100ms ease-out;
`;

const TipsButton = styled.button`
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
    ${TipsLabel} {
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
  transition: all .2s linear;

  &.open {
    transform: rotate(0deg);
  }
`;

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  z-index: 2;
  padding: 40px 50px;
  background: ${colors.lightGreyishBlue};
  margin-top: 1px;

  ${media.largePhone`
    padding: 30px 20px;
  `}

  &.tips-enter {
    height: 0;
    opacity: 0;

    &.tips-enter-active {
      height: 265px;
      opacity: 1;
      transition: all 250ms ease-out;
    }
  }

  &.tips-exit {
    height: 265px;
    opacity: 1;

    &.tips-exit-active {
      height: 0;
      opacity: 0;
      transition: all 250ms ease-out;
    }
  }
`;

export interface Props {
  className?: string;
}

const CollapsibleTipsBox = memo<Props>((props) => {
  const [showTips, setShowTips] = useState<boolean>(false);

  const handleTipsToggle = useCallback(() => {
    setShowTips(!showTips);
  }, [showTips]);

  const { className } = props;

  return (
    <Container className={className}>
      <TipsButton aria-expanded={showTips} onClick={handleTipsToggle}>
        <TipsLabel>
          <FormattedMessage {...messages.tipsTitle} />
        </TipsLabel>
        <ArrowIcon name="dropdown" className={showTips ? 'open' : ''}/>
      </TipsButton>
      <CSSTransition
        classNames="tips"
        in={showTips}
        timeout={300}
        mountOnEnter={true}
        unmountOnExit={true}
        exit={true}
      >
        <Wrapper>
          <TipsContent />
        </Wrapper>
      </CSSTransition>
    </Container>
  );

});

export default CollapsibleTipsBox;

import React, { memo, useCallback, MouseEvent } from 'react';
import clHistory from 'utils/cl-router/history';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import VoteIndicator from 'components/InitiativeCard/VoteIndicator';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  background: #fff;
  border-bottom: solid 1px ${lighten(0.4, colors.label)};

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const TopBarInner = styled.div`
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.biggerThanMinTablet`
    padding-left: 30px;
    padding-right: 30px;
  `}
`;

const Left = styled.div`
  height: 48px;
  align-items: center;
  display: none;

  ${media.smallerThanMaxTablet`
    display: flex;
  `}
`;

const Right = styled.div``;

const GoBackIcon = styled(Icon)`
  height: 22px;
  fill: ${colors.label};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const GoBackButton = styled.button`
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  margin-right: 6px;
  margin-left: -2px;
  cursor: pointer;
  background: #fff;
  border-radius: 50%;
  border: solid 1px ${lighten(0.2, colors.label)};
  transition: all 100ms ease-out;

  &:hover {
    border-color: #000;

    ${GoBackIcon} {
      fill: #000;
    }
  }
`;

const GoBackLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  transition: fill 100ms ease-out;

  ${media.phone`
    display: none;
  `}
`;

interface Props {
  initiativeId: string;
  insideModal?: boolean;
  className?: string;
}

const InitiativeShowPageTopBar = memo<Props>(
  ({ initiativeId, insideModal, className }) => {
    const onGoBack = useCallback((event: MouseEvent<HTMLElement>) => {
      event.preventDefault();

      if (insideModal) {
        eventEmitter.emit('closeIdeaModal');
      } else {
        clHistory.push('/');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Container className={className || ''}>
        <TopBarInner>
          <Left>
            <GoBackButton onClick={onGoBack}>
              <GoBackIcon name="arrow-back" />
            </GoBackButton>
            <GoBackLabel>
              <FormattedMessage {...messages.goBack} />
            </GoBackLabel>
          </Left>
          <Right>
            <VoteIndicator initiativeId={initiativeId} />
          </Right>
        </TopBarInner>
      </Container>
    );
  }
);

export default InitiativeShowPageTopBar;

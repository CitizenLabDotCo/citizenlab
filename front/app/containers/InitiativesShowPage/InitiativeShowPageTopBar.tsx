import React, { useCallback, MouseEvent, useState, useEffect } from 'react';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import ReactionIndicator from 'components/InitiativeCard/ReactionIndicator';

// router
import clHistory from 'utils/cl-router/history';
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

// utils
import { isString } from 'lodash-es';

const Container = styled.div`
  // should use props.theme.mobileTopBarHeight but it needs to have the
  // correct value first (or padding/margin on InitiativesShow should be fixed)
  // height: ${(props) => props.theme.mobileTopBarHeight}px;
  height: 78px;
  background: #fff;
  border-bottom: solid 1px ${lighten(0.4, colors.textSecondary)};

  ${media.desktop`
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

  ${media.desktop`
    padding-left: 30px;
    padding-right: 30px;
  `}
`;

const Left = styled.div`
  height: 48px;
  align-items: center;
  display: none;

  ${media.tablet`
    display: flex;
  `}
`;

const Right = styled.div``;

const GoBackIcon = styled(Icon)`
  fill: ${colors.textSecondary};
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
  border: solid 1px ${lighten(0.2, colors.textSecondary)};
  transition: all 100ms ease-out;

  &:hover {
    border-color: #000;

    ${GoBackIcon} {
      fill: #000;
    }
  }
`;

const GoBackLabel = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  transition: fill 100ms ease-out;

  ${media.phone`
    display: none;
  `}
`;

interface Props {
  initiativeId: string;
  className?: string;
}

const InitiativeShowPageTopBar = ({ initiativeId, className }: Props) => {
  const [goBack, setGoBack] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const goBackParameter = searchParams.get('go_back');

    if (isString(goBackParameter)) {
      setGoBack(true);
      removeSearchParams(['go_back']);
    }
  }, [searchParams]);

  const onGoBack = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();

      if (goBack) {
        clHistory.goBack();
      } else {
        clHistory.push('/');
      }
    },
    [goBack]
  );

  return (
    <Container className={className || ''}>
      <TopBarInner>
        <Left>
          <GoBackButton onClick={onGoBack}>
            <GoBackIcon name="arrow-left" />
          </GoBackButton>
          <GoBackLabel>
            <FormattedMessage {...messages.goBack} />
          </GoBackLabel>
        </Left>
        <Right>
          <ReactionIndicator initiativeId={initiativeId} />
        </Right>
      </TopBarInner>
    </Container>
  );
};

export default InitiativeShowPageTopBar;

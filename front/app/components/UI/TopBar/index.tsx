import React, { memo, useCallback, MouseEvent } from 'react';
import { isNil } from 'lodash-es';

// components
import { Icon } from 'cl2-component-library';

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

const GoBackButton = styled.div`
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  margin-left: -2px;
  cursor: pointer;
  background: #fff;
  border-radius: 50%;
  border: solid 1px ${lighten(0.4, colors.label)};
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
  children: JSX.Element | null | undefined;
  goBack?: () => void;
  className?: string;
}

const TopBar = memo<Props>(({ children, goBack, className }) => {
  const onGoBack = useCallback((event: MouseEvent) => {
    event.preventDefault();
    goBack && goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className={className}>
      <TopBarInner>
        <Left>
          {!isNil(goBack) && (
            <>
              <GoBackButton onClick={onGoBack}>
                <GoBackIcon name="arrow-back" ariaHidden />
              </GoBackButton>
              <GoBackLabel>
                <FormattedMessage {...messages.goBack} />
              </GoBackLabel>
            </>
          )}
        </Left>
        {!isNil(children) && <Right>{children}</Right>}
      </TopBarInner>
    </Container>
  );
});

export default TopBar;

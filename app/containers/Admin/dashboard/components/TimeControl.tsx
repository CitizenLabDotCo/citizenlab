import React, { PureComponent } from 'react';
import * as moment from 'moment';

// components
import Icon from 'components/UI/Icon';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

const Container = styled.div`
  display: flex;
  background: ${colors.adminContentBackground};
  border: solid 1px ${colors.adminBorder};
  border-radius: 5px;
  overflow: hidden;
`;

const StyledIcon = styled(Icon)`
  width: 15px;
  height: 15px;
  fill: ${colors.adminSecondaryTextColor};
`;

const PrevIcon = StyledIcon.extend``;

const NextIcon = StyledIcon.extend`
  transform: rotate(180deg);
`;

const TimeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  padding: 1rem 1.5rem;

  &:hover, &:focus {
    background: ${rgba(colors.adminTextColor, .2)};

    ${PrevIcon},
    ${NextIcon} {
      fill: ${colors.adminTextColor};
    }
  }
`;

const Separator = styled.div`
  width: 1px;
  background-color: ${colors.adminSeparation};
`;

const CurrentTime = styled.div`
  min-width: 160px;
  font-size: ${fontSizes.base}px;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
`;

type Props  = {
  value: number;
  interval: 'weeks' | 'months' | 'years';
  currentTime?: moment.Moment;
  onChange: (arg: number) => void;
};

type State  = {
  currentTime: string | undefined;
};

class TimeControl extends PureComponent<Props & InjectedIntlProps, State> {
  static getDerivedStateFromProps(nextProps: Props & InjectedIntlProps, _prevState: State) {
    const getCurrentTime = () => {
      const { currentTime, interval } = nextProps;
      const { formatDate } = nextProps.intl;

      if (currentTime) {
        const fromTime = currentTime;
        const toTime = fromTime.clone().add(1, interval);

        switch (interval) {
          case 'weeks':
            const from = formatDate(fromTime.toDate(), {
              day: '2-digit',
              weekday: 'short'
            });
            const to = formatDate(toTime.toDate(), {
              day: '2-digit',
              weekday: 'short',
              year: 'numeric',
              month: 'short',
            });
            return `${from} - ${to}`;
          case 'months':
            return formatDate(fromTime.toDate(), {
              month: 'long',
              year: 'numeric',
            });
          case 'years':
            return formatDate(fromTime.toDate(), {
              year: 'numeric',
            });
          default:
            break;
        }
      }

      return;
    };

    return {
      currentTime: getCurrentTime()
    };
  }

  handlePrevious = () => {
    this.props.onChange(this.props.value - 1);
  }

  handleNext = () => {
    this.props.onChange(this.props.value + 1);
  }

  render() {
    return (
      <Container>
        <TimeButton onClick={this.handlePrevious}>
          <NextIcon name="chevron-right" />
        </TimeButton>
        <Separator />
        <CurrentTime>
          {this.state.currentTime}
        </CurrentTime>
        <Separator />
        <TimeButton onClick={this.handleNext}>
          <PrevIcon name="chevron-right" />
        </TimeButton>
      </Container>
    );
  }
}

export default injectIntl<Props>(TimeControl);

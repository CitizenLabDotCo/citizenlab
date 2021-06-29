import React, { memo } from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const EventDateBlocks = styled.div`
  flex: 0 0 75px;
  width: 75px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.smallerThanMinTablet`
    flex: 0 0 60px;
    width: 60x;
  `}
`;

const Separator = styled.div`
  height: 18px;

  ${media.smallerThanMinTablet`
    width: 15px;
    height: auto;
  `}
`;

const EventDateBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.second {
    margin-top: 14px;
  }
`;

const EventDateBlockLabel = styled.div`
  color: ${colors.label};
  font-size: 12px;
  line-height: normal;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const EventDateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  padding: 6px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: #f5f6f7;
  border: solid 1px #ccc;
  border-bottom: none;

  ${media.smallerThanMinTablet`
    padding: 4px;
  `}
`;

const EventMonth = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: 14px;
  line-height: normal;
  font-weight: 500;
  text-transform: uppercase;
`;

const EventDay = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: 17px;
  line-height: normal;
  font-weight: 400;

  ${media.smallerThanMinTablet`
    font-size: 16px;
  `}
`;

const EventYear = styled.div`
  color: #fff;
  font-size: 16px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: ${colors.label};

  ${media.smallerThanMinTablet`
    font-size: 14px;
  `}
`;

interface Props {
  startAtDay: string;
  endAtDay: string;
  startAtMonth: string;
  endAtMonth: string;
  startAtYear: string;
  endAtYear: string;
  isMultiMonth: boolean;
  isMultiYear: boolean;
  isMultiDayEvent: boolean;
}

export default memo<Props>((props) => {
  const {
    startAtDay,
    endAtDay,
    startAtMonth,
    endAtMonth,
    startAtYear,
    endAtYear,
    isMultiMonth,
    isMultiYear,
    isMultiDayEvent,
  } = props;

  return (
    <EventDateBlocks>
      <EventDateBlockWrapper className={isMultiYear ? 'first' : ''}>
        {isMultiYear && (
          <EventDateBlockLabel>
            <FormattedMessage {...messages.startsAt} />
          </EventDateBlockLabel>
        )}
        <EventDateBlock>
          <EventDate>
            <EventMonth>{startAtMonth}</EventMonth>
            <EventDay>{startAtDay}</EventDay>
            {isMultiDayEvent && !isMultiYear && (
              <>
                <Separator>-</Separator>
                {isMultiMonth && <EventMonth>{endAtMonth}</EventMonth>}
                <EventDay>{endAtDay}</EventDay>
              </>
            )}
          </EventDate>
          <EventYear>
            <span>{startAtYear}</span>
          </EventYear>
        </EventDateBlock>
      </EventDateBlockWrapper>

      {isMultiDayEvent && isMultiYear && (
        <EventDateBlockWrapper className={isMultiYear ? 'second' : ''}>
          {isMultiYear && (
            <EventDateBlockLabel>
              <FormattedMessage {...messages.endsAt} />
            </EventDateBlockLabel>
          )}
          <EventDateBlock>
            <EventDate>
              <EventMonth>{endAtMonth}</EventMonth>
              <EventDay>{endAtDay}</EventDay>
            </EventDate>
            <EventYear>
              <span>{endAtYear}</span>
            </EventYear>
          </EventDateBlock>
        </EventDateBlockWrapper>
      )}
    </EventDateBlocks>
  );
});

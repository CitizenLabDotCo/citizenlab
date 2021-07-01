import React, { memo, useRef, useState, useEffect } from 'react';
import { isEmpty, every } from 'lodash-es';
import moment from 'moment';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { Icon } from 'cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';

// hooks
import useResourceFiles from 'hooks/useResourceFiles';
import useProject from 'hooks/useProject';

// services
import { IEventData } from 'services/events';

// i18n
import T from 'components/T';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled, { useTheme } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// other
import checkTextOverflow from './checkTextOverflow';
import { isNilOrError } from 'utils/helperUtils';

const EventInformationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 23px;
  margin-top: 4px;
`;

const EventTitleAndMeta = styled.div`
  margin-bottom: 18px;
`;

const ProjectTitle = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xs}px;
  margin: 0 0 5px 0;
`;

const EventTitle = styled.h3`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 700;
  line-height: normal;
  margin: 0 0 13px 0;
`;

const EventMetaContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const EventMeta = styled.div<{ first?: boolean }>`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xs}px;
  margin-left: ${({ first }) => (first ? 0 : 23)}px;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  width: ${fontSizes.base}px;
  height: ${fontSizes.base}px;
  fill: ${colors.label};
  margin-right: 6px;
`;

const EventDescription = styled.div``;

const SMALL_LINE_HEIGHT = fontSizes.small + 2.45;

interface IStyledT {
  hideTextOverflow?: boolean;
}

// https://css-tricks.com/line-clampin/#the-fade-out-way
const StyledT = styled(T)<IStyledT>`
  ${({ hideTextOverflow }) => {
    if (hideTextOverflow) {
      return `
        overflow: hidden;
        height: calc(${SMALL_LINE_HEIGHT}px * 4);

        &:after {
          content: "";
          text-align: right;
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          height: ${SMALL_LINE_HEIGHT * 2}px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 100%);
        }
      `;
    }

    return '';
  }}

  p {
    font-size: ${fontSizes.small}px;
    line-height: ${SMALL_LINE_HEIGHT}px;
  }

  color: ${(props: any) => props.theme.colorText};
  position: relative;
  display: block;
`;

const ReadMoreOrLessWrapper = styled.div`
  margin-top: 18px;
`;

const ReadMoreOrLess = styled.a`
  color: ${colors.label};
  cursor: pointer;
  font-weight: 600;
  text-decoration-line: underline;

  &:hover {
    color: ${({ theme }) => theme.colorMain};
    text-decoration-line: underline;
  }
`;

interface Props {
  event: IEventData;
  startAtMoment: moment.Moment;
  endAtMoment: moment.Moment;
  isMultiDayEvent: boolean;
  showProjectTitle: boolean;
}

const EventInformation = memo<Props & InjectedIntlProps>((props) => {
  const {
    event,
    isMultiDayEvent,
    startAtMoment,
    endAtMoment,
    showProjectTitle,
    intl,
  } = props;

  const theme: any = useTheme();

  const eventFiles = useResourceFiles({
    resourceType: 'event',
    resourceId: event.id,
  });

  const hasLocation = !every(event.attributes.location_multiloc, isEmpty);
  const eventDateTime = isMultiDayEvent
    ? `${startAtMoment.format('LLL')} - ${endAtMoment.format('LLL')}`
    : `${startAtMoment.format('LL')} • ${startAtMoment.format(
        'LT'
      )} - ${endAtMoment.format('LT')}`;

  const projectId = event.relationships.project.data.id;
  const project = useProject({ projectId });
  const projectTitle = project?.attributes.title_multiloc;

  const TElement = useRef(null);

  const [textOverflow, setTextOverflow] = useState(true);
  const [hideTextOverflow, setHideTextOverflow] = useState(true);

  const showHiddenText = () => setHideTextOverflow(true);
  const hideText = () => setHideTextOverflow(false);

  useEffect(() => {
    if (textOverflow === false) return;

    setTextOverflow(true);

    setTimeout(() => {
      setTextOverflow(checkTextOverflow(TElement));
    }, 0);
  }, [TElement]);

  return (
    <>
      <EventInformationContainer data-testid="EventInformation">
        <EventTitleAndMeta>
          {showProjectTitle && projectTitle && (
            <ProjectTitle>
              <T value={projectTitle} />
            </ProjectTitle>
          )}

          <EventTitle>
            <T value={event.attributes.title_multiloc} />
          </EventTitle>

          <EventMetaContainer>
            <EventMeta first={true}>
              <StyledIcon name="clock" />
              {eventDateTime}
            </EventMeta>

            {hasLocation && (
              <EventMeta>
                <StyledIcon name="mapmarker" />
                <T value={event.attributes.location_multiloc} />
              </EventMeta>
            )}
          </EventMetaContainer>
        </EventTitleAndMeta>

        <EventDescription>
          <QuillEditedContent textColor={theme.colorText}>
            <StyledT
              value={event.attributes.description_multiloc}
              supportHtml={true}
              ref={TElement}
              hideTextOverflow={hideTextOverflow && textOverflow}
            />
          </QuillEditedContent>

          {textOverflow && hideTextOverflow && (
            <ReadMoreOrLessWrapper data-testid="ReadMoreButton">
              <ReadMoreOrLess onClick={showHiddenText}>
                {intl.formatMessage(messages.readMore)}
              </ReadMoreOrLess>
            </ReadMoreOrLessWrapper>
          )}

          {!hideTextOverflow && (
            <ReadMoreOrLessWrapper>
              <ReadMoreOrLess onClick={hideText}>
                {intl.formatMessage(messages.readLess)}
              </ReadMoreOrLess>
            </ReadMoreOrLessWrapper>
          )}
        </EventDescription>

        {!isNilOrError(eventFiles) && eventFiles.length > 0 && (
          <FileAttachments files={eventFiles} />
        )}
      </EventInformationContainer>
    </>
  );
});

export default injectIntl(EventInformation);

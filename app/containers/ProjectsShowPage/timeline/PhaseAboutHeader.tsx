import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { indexOf } from 'lodash-es';
import bowser from 'bowser';

// hooks
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import usePhases from 'hooks/usePhases';

// components
import IdeaButton from 'components/IdeaButton';

// i18n
import messages from '../messages';
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Left = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const PhaseNumberWrapper = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 50%;
  background: ${colors.label};

  &.present {
    background: ${colors.clGreen};
  }
`;

const PhaseNumber = styled.div`
  color: #fff;
  font-size: ${fontSizes.base}px;
  line-height: 16px;
  font-weight: 500;
`;

const HeaderTitleWrapper = styled.div`
  min-height: 55px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  align-items: center;
  flex-direction: row;

  &.ie {
    height: 55px;
    min-height: auto;
  }

  ${media.smallerThanMinTablet`
    min-height: unset;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    margin-right: 0px;
  `}
`;

const HeaderTitle = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  line-height: 25px;
  font-weight: 600;
  margin: 0;
  margin-right: 20px;
  padding: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.large}px;
    line-height: 24px;
  `}
`;

interface Props {
  projectId: string;
  selectedPhaseId: string | null;
  className?: string;
}

const PhaseAboutHeader = memo<Props>(
  ({ projectId, selectedPhaseId, className }) => {
    const locale = useLocale();
    const tenant = useTenant();
    const phases = usePhases(projectId);

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(phases) &&
      phases.length > 0
    ) {
      const phaseIds = phases ? phases.map((phase) => phase.id) : null;
      const tenantLocales = tenant.data.attributes.settings.core.locales;
      const selectedPhase = selectedPhaseId
        ? phases.find((phase) => phase.id === selectedPhaseId)
        : null;
      const selectedPhaseTitle = selectedPhase
        ? getLocalized(
            selectedPhase.attributes.title_multiloc,
            locale,
            tenantLocales
          )
        : null;
      const selectedPhaseNumber = selectedPhase
        ? indexOf(phaseIds, selectedPhaseId) + 1
        : null;
      const isSelected = selectedPhaseId !== null;
      const phaseStatus =
        selectedPhase &&
        pastPresentOrFuture([
          selectedPhase.attributes.start_at,
          selectedPhase.attributes.end_at,
        ]);

      return (
        <Container className={className || ''}>
          <Left>
            {isSelected && (
              <PhaseNumberWrapper
                aria-hidden
                className={`${isSelected && 'selected'} ${phaseStatus}`}
              >
                <PhaseNumber
                  className={`${isSelected && 'selected'} ${phaseStatus}`}
                >
                  {selectedPhaseNumber}
                </PhaseNumber>
              </PhaseNumberWrapper>
            )}

            <HeaderTitleWrapper className={bowser.msie ? 'ie' : ''}>
              <HeaderTitle
                aria-hidden
                className={`${isSelected && 'selected'} ${phaseStatus}`}
              >
                {selectedPhaseTitle || (
                  <FormattedMessage {...messages.noPhaseSelected} />
                )}
              </HeaderTitle>
              <ScreenReaderOnly>
                <FormattedMessage
                  {...messages.a11y_selectedPhaseX}
                  values={{
                    selectedPhaseNumber,
                    selectedPhaseTitle,
                  }}
                />
              </ScreenReaderOnly>
            </HeaderTitleWrapper>
          </Left>

          <Right>
            <IdeaButton
              projectId={projectId}
              phaseId={selectedPhaseId}
              participationContextType="phase"
            />
          </Right>
        </Container>
      );
    }

    return null;
  }
);

export default PhaseAboutHeader;

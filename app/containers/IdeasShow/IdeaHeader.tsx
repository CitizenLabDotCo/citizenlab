import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import GetMachineTranslation from 'resources/GetMachineTranslation';
import { FormattedMessage } from 'utils/cl-intl';
import StatusBadge from 'components/StatusBadge';
import messages from './messages';
import { Locale } from 'typings';
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
`;

const IdeaTitle = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxl}px;
  font-weight: 500;
  line-height: 40px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
    margin-right: 12px;
  `}
`;

const StatusContainer = styled.div`
  margin-top: 5px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StatusTitle = styled.h4`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  margin: 0;
  margin-bottom: 8px;
  padding: 0;
`;

interface Props {
  ideaId: string;
  statusId?: string | null;
  ideaTitle: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
}

const IdeaHeader = memo<Props>((props: Props) => {
  const { ideaId, statusId, ideaTitle, locale, translateButtonClicked } = props;

  return (
    <HeaderWrapper>
      <Header>
        {locale && translateButtonClicked ?
          <GetMachineTranslation attributeName="title_multiloc" localeTo={locale} ideaId={ideaId}>
            {translation => {
              if (!isNilOrError(translation)) {
                return <IdeaTitle>{translation.attributes.translation}</IdeaTitle>;
              }

              return <IdeaTitle>{ideaTitle}</IdeaTitle>;
            }}
          </GetMachineTranslation>
          :
          <IdeaTitle className="e2e-ideatitle">{ideaTitle}</IdeaTitle>
        }

        {statusId &&
          <StatusContainer>
            <StatusTitle><FormattedMessage {...messages.currentStatus} /></StatusTitle>
            <StatusBadge id="e2e-idea-status-badge" statusId={statusId} />
          </StatusContainer>
        }
      </Header>
    </HeaderWrapper>
  );
});

export default IdeaHeader;

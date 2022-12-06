import React, { memo } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { darken } from 'polished';
// hooks
import useSimilarIdeas from '../hooks/useSimilarIdeas';
// analytics
import { trackEventByName } from 'utils/analytics';
// i18n
import { injectIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { colors, fontSizes } from 'utils/styleUtils';
import { Header, Item } from 'components/IdeasShowComponents/MetaInfoStyles';
// components
import T from 'components/T';
// styles
import styled from 'styled-components';
import messages from '../messages';
import tracks from '../tracks';

const IdeaList = styled.ul`
  margin: 0;
  padding: 0;
  padding-left: 17px;
`;

const IdeaListItem = styled.li`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0px;
  }
`;

const IdeaLink = styled(Link)`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: normal;
  text-decoration: underline;

  &:hover {
    color: ${darken(0.2, colors.textSecondary)};
    text-decoration: underline;
  }
`;

interface Props {
  ideaId: string;
  compact?: boolean;
  className?: string;
}

const SimilarIdeas = memo<Props & WrappedComponentProps>(
  ({ ideaId, compact, className, intl: { formatMessage } }) => {
    const similarIdeas = useSimilarIdeas({ ideaId, pageSize: 5 });
    const onClickIdeaLink = (index: number) => () => {
      trackEventByName(tracks.clickSimilarIdeaLink.name, { extra: { index } });
    };

    if (!isNilOrError(similarIdeas) && similarIdeas.length > 0) {
      return (
        <Item className={className || ''} compact={compact}>
          <Header>{formatMessage(messages.similarInputs)}</Header>
          <IdeaList className={className}>
            {similarIdeas.map((similarIdea, index) => (
              <IdeaListItem key={similarIdea.id}>
                <IdeaLink
                  to={`/ideas/${similarIdea.attributes.slug}`}
                  onClick={onClickIdeaLink(index)}
                >
                  <T value={similarIdea.attributes.title_multiloc} />
                </IdeaLink>
              </IdeaListItem>
            ))}
          </IdeaList>
        </Item>
      );
    }

    return null;
  }
);

export default injectIntl(SimilarIdeas);

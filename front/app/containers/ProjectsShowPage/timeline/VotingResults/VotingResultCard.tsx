import React from 'react';
import bowser from 'bowser';

// api
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import useIdeaImage from 'api/idea_images/useIdeaImage';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import {
  useBreakpoint,
  Box,
  defaultCardStyle,
  defaultCardHoverStyle,
  media,
  Text,
} from '@citizenlab/cl2-component-library';
import Image from 'components/UI/Image';
import ImagePlaceholder from './ImagePlaceholder';
import Rank from './Rank';
import Footer from 'components/IdeaCard/Footer';
import FormattedBudget from 'utils/currency/FormattedBudget';
import ProgressBar from './ProgressBar';

// styling
import styled from 'styled-components';

// router
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

// typings
import { IIdeaData } from 'api/ideas/types';

const cardPadding = '17px';
const cardInnerHeight = '162px';
const cardInnerHeightExtended = '180px';

const Container = styled(Link)`
  width: 100%;
  min-height: calc(${cardInnerHeight} + ${cardPadding} + ${cardPadding});
  display: flex;
  align-items: center;
  padding: ${cardPadding};
  ${defaultCardStyle};
  cursor: pointer;

  &.desktop {
    ${defaultCardHoverStyle};
    transform: translate(0px, -2px);
  }

  @media (max-width: 1220px) and (min-width: 1023px) {
    min-height: calc(
      ${cardInnerHeightExtended} + ${cardPadding} + ${cardPadding}
    );
  }

  ${media.tablet`
    min-height: unset;
    flex-direction: column;
    align-items: stretch;
  `}
`;

const IdeaCardImageWrapper = styled.div`
  flex: 0 0 ${cardInnerHeight};
  width: ${cardInnerHeight};
  height: ${cardInnerHeight};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
  overflow: hidden;
  border-radius: ${(props) => props.theme.borderRadius};

  @media (max-width: 1220px) and (min-width: 1023px) {
    height: ${cardInnerHeightExtended};
  }

  ${media.tablet`
    width: 100%;
    margin-bottom: 18px;
  `}
`;

const IdeaCardImage = styled(Image)`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const ContentWrapper = styled.div`
  height: ${cardInnerHeight};
  flex: 0 1 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 0px;
  padding-bottom: 2px;

  @media (max-width: 1220px) and (min-width: 1023px) {
    height: ${cardInnerHeightExtended};
  }

  ${media.tablet`
    height: unset;
  `}
`;

const Header = styled.header`
  padding: 0;
  margin: 0;
  margin-bottom: 12px;

  ${media.tablet`
    margin-bottom: 15px;
  `}
`;

const Title = styled.h3`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: 21px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 26px;
  max-height: 78px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Body = styled.div`
  flex-grow: 1;

  ${media.tablet`
    margin-bottom: 25px;
  `}
`;

interface Props {
  idea: IIdeaData;
  phaseId: string;
  rank: number;
}

const VotingResultCard = ({ idea, phaseId, rank }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(idea.relationships.project.data.id);
  const { data: ideaImage } = useIdeaImage(
    idea.id,
    idea.relationships.idea_images.data?.[0]?.id
  );
  const smallerThanPhone = useBreakpoint('phone');

  if (!phase || !project) return null;

  const budget = idea.attributes.budget;
  const ideaTitle = localize(idea.attributes.title_multiloc);
  const votingMethod = phase.data.attributes.voting_method;
  const url = `/ideas/${idea.attributes.slug}?go_back=true`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSearchParams({ scroll_to_card: idea.id });

    clHistory.push(url, {
      scrollToTop: true,
    });
  };

  const image = ideaImage?.data.attributes.versions.medium;

  return (
    <Container
      id={idea.id}
      to={url}
      onClick={handleClick}
      className={`e2e-card ${
        !(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'
      }`}
    >
      {image && (
        <IdeaCardImageWrapper>
          <Box w="100%" h="100%" flex="1" position="relative">
            <IdeaCardImage src={image} cover={true} alt="" />
            <Box
              position="absolute"
              mt={smallerThanPhone ? '0px' : '12px'}
              ml={smallerThanPhone ? '0px' : '12px'}
            >
              <Rank rank={rank} />
            </Box>
          </Box>
        </IdeaCardImageWrapper>
      )}

      {!image && !smallerThanPhone && (
        <IdeaCardImageWrapper>
          <Box w="100%" h="100%" flex="1" position="relative">
            <ImagePlaceholder
              placeholderIconName={
                votingMethod === 'budgeting' ? 'money-bag' : 'idea'
              }
            />
            <Box position="absolute" mt="12px" ml="12px">
              <Rank rank={rank} />
            </Box>
          </Box>
        </IdeaCardImageWrapper>
      )}

      <ContentWrapper>
        {!image && smallerThanPhone && (
          <Box mb="12px" display="flex">
            <Rank rank={rank} />
          </Box>
        )}

        <Header>
          <Title title={ideaTitle}>{ideaTitle}</Title>
          {phase.data.attributes.voting_method === 'budgeting' &&
            typeof budget === 'number' && (
              <Text mb="8px" mt="8px" color="tenantPrimary">
                {formatMessage(messages.cost)}{' '}
                <FormattedBudget value={budget} />
              </Text>
            )}
        </Header>

        <Body>
          <Box h="100%" display="flex" alignItems="flex-end">
            <ProgressBar idea={idea} phase={phase} />
          </Box>
        </Body>
        <Footer
          project={project}
          idea={idea}
          hideIdeaStatus={true}
          participationMethod="voting"
        />
      </ContentWrapper>
    </Container>
  );
};

export default VotingResultCard;

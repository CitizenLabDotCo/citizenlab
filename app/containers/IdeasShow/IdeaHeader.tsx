import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetMachineTranslation from 'resources/GetMachineTranslation';
import { FormattedMessage } from 'utils/cl-intl';
import StatusBadge from 'components/StatusBadge';
import T from 'components/T';
import messages from './messages';
import { Locale } from 'typings';
import Link from 'utils/cl-router/Link';
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const HeaderWrapper = styled.div`
  width: 100%;
  padding-right: 250px;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    padding-right: 0px;
  `}
`;

const BelongsToProject = styled.p`
  width: 100%;
  color: ${colors.label};
  font-weight: 300;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin-bottom: 10px;
`;

const ProjectLink = styled(Link)`
  color: inherit;
  font-weight: 400;
  font-size: inherit;
  line-height: inherit;
  text-decoration: underline;
  transition: all 100ms ease-out;
  margin-left: 4px;

  &:hover {
    color: ${darken(0.2, colors.label)};
    text-decoration: underline;
  }
`;

const Header = styled.div`
  margin-bottom: 45px;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    margin-bottom: 25px;
  `}
`;

const IdeaTitle = styled.h1`
  width: 100%;
  color: #444;
  font-size: ${fontSizes.xxxxl}px;
  font-weight: 500;
  line-height: 38px;
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

interface DataProps {
  project: GetProjectChildProps;
}

interface InputProps {
  ideaId: string;
  statusId?: string | null;
  ideaTitle: string;
  projectId: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  onTranslationLoaded?: () => void;
}

interface Props extends InputProps, DataProps {}

const IdeaHeader = React.memo<Props>((props: Props) => {
  const { ideaId, statusId, ideaTitle, project, locale, translateButtonClicked, onTranslationLoaded } = props;

  return (
    <HeaderWrapper>
      {!isNilOrError(project) &&
        <BelongsToProject>
          <FormattedMessage
            {...messages.postedIn}
            values={{
              projectLink:
                <ProjectLink className="e2e-project-link" to={`/projects/${project.attributes.slug}`}>
                  <T value={project.attributes.title_multiloc} />
                </ProjectLink>
            }}
          />
        </BelongsToProject>
      }

      <Header>
        {locale && onTranslationLoaded && translateButtonClicked ?
          <GetMachineTranslation attributeName="title_multiloc" localeTo={locale} ideaId={ideaId}>
            {translation => {
              if (!isNilOrError(translation)) {
                onTranslationLoaded();
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
            <StatusBadge statusId={statusId} />
          </StatusContainer>
        }
      </Header>
    </HeaderWrapper>
  );
});

export default (inputProps: InputProps) => (
  <GetProject id={inputProps.projectId}>
    {project => <IdeaHeader {...inputProps} project={project} />}
  </GetProject>
);

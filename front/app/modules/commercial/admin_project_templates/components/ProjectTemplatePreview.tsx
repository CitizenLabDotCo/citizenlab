import React, { memo, useCallback, useState, useEffect } from 'react';

import { gql, useQuery } from '@apollo/client';
import {
  Icon,
  Spinner,
  colors,
  fontSizes,
  media,
} from '@citizenlab/cl2-component-library';
import * as clipboard from 'clipboard-polyfill';
import { lighten } from 'polished';
import styled from 'styled-components';

import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';
import useLocalize from 'hooks/useLocalize';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Centerer from 'components/UI/Centerer';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import tracks from '../tracks';
import { client } from '../utils/apolloUtils';

import messages from './messages';

const Arrow = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="134.282 57.93 18.666 24" aria-hidden={true} {...props}>
      <path d="M144.617 80.289l8.1-9.719c.309-.371.309-.91 0-1.281l-8.1-9.719a1 1 0 0 1 .769-1.641h-11.104c.297 0 .578.132.769.359l9.166 11c.309.371.309.91 0 1.281l-9.166 11a1 1 0 0 1-.769.359h11.104a.999.999 0 0 1-.769-1.639z" />
    </svg>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 1050px;
  padding: 65px;
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px #e0e0e0;

  ${media.phone`
    padding: 30px;
  `}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 60px;

  ${media.phone`
    flex-direction: column;
    align-items: stretch;
  `}
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;

  ${media.desktop`
    margin-left: 30px;
  `}
`;

const Title = styled.h1`
  color: ${colors.primary};
  font-size: ${fontSizes.xxl}px;
  font-weight: 600;
  line-height: normal;
  padding: 0;
  margin: 0;
  margin-bottom: 10px;

  ${media.phone`
    margin-bottom: 5px;
  `}
`;

const Subtitle = styled.h2`
  color: ${colors.primary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  padding: 0;
  margin-top: 0;
  margin-bottom: 5px;

  ${media.phone`
    padding-bottom: 35px;
  `}
`;

const LinkCopied = styled.div`
  color: ${colors.success};
  display: flex;
  align-items: center;
  opacity: 0;
  transition: all 150ms ease-out;

  &.visible {
    opacity: 1;
  }

  ${media.phone`
    order: 2;
  `}
`;

const LinkCopiedIcon = styled(Icon)`
  fill: ${colors.success};
`;

const CopyLinkButton = styled(ButtonWithLink)`
  margin-left: 20px;

  ${media.phone`
    order: 1;
    margin-left: 0px;
    margin-right: 20px;
  `}
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const MetaInfoLeft = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const Department = styled.div`
  color: ${colors.primary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: normal;
  white-space: nowrap;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px ${colors.divider};
  margin-right: 5px;
  margin-bottom: 5px;
`;

const MetaInfoRight = styled.div`
  display: flex;
  align-items: center;
  margin-left: 30px;
`;

const MetaInfoRightBox = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  margin-right: 30px;

  &.last {
    margin-right: 0px;
  }
`;

const MetaInfoRightBoxIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 7px;
`;

const MetaInfoRightBoxText = styled.span``;

const Content = styled.div`
  margin-bottom: 40px;
`;

const Phases = styled.div`
  width: 100%;
  padding-top: 20px;
  padding-bottom: 60px;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`;

const PhaseBar = styled.button`
  width: 100%;
  height: 24px;
  color: #fff;
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${lighten(0.15, colors.textSecondary)};
  transition: background 60ms ease-out;
  position: relative;
  border: none;
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const PhaseArrow = styled(Arrow)`
  width: 20px;
  height: 25px;
  fill: #fff;
  position: absolute;
  top: 0px;
  right: -9px;
  z-index: 2;

  ${media.tablet`
    fill: ${colors.background};
  `}
`;

const PhaseText = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 20px;
  max-height: 60px;
  margin-top: 12px;
  padding-left: 6px;
  padding-right: 6px;
  transition: color 60ms ease-out;
`;

const PhaseContainer = styled.div`
  min-width: 80px;
  flex-shrink: 1;
  flex-grow: 10;
  flex-basis: auto;
  display: flex;
  flex-direction: column;
  position: relative;

  &.first ${PhaseBar} {
    border-radius: ${(props) => props.theme.borderRadius} 0px 0px
      ${(props) => props.theme.borderRadius};
  }

  &.last ${PhaseBar} {
    border-radius: 0px ${(props) => props.theme.borderRadius}
      ${(props) => props.theme.borderRadius} 0px;
  }
`;

const HeaderImage = styled.div<{ src: string }>`
  width: 100%;
  height: 260px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${({ src }) => src});
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  margin-bottom: 20px;
`;

const Footer = styled.div``;

const SuccessCasesTitle = styled.div`
  width: 100%;
  color: ${colors.primary};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: normal;
  margin-bottom: 20px;
`;

const SuccessCases = styled.div``;

const SuccessCase = styled.a`
  padding: 12px 20px;
  margin-right: 8px;
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px ${colors.divider};
  transition: all 80ms ease-out;

  &:hover {
    border-color: #999;
  }
`;

const SuccessCaseImage = styled.img`
  height: 26px;
`;

export interface Props {
  projectTemplateId: string;
  className?: string;
}

const ProjectTemplatePreview = memo<Props>(
  ({ projectTemplateId, className }) => {
    const localize = useLocalize();
    const graphqlTenantLocales = useGraphqlTenantLocales();

    const [linkCopied, setLinkCopied] = useState(false);

    const TEMPLATE_QUERY = gql`
    {
      projectTemplate(id: "${projectTemplateId}"){
        id
        headerImage
        departments {
          id
          titleMultiloc {
            ${graphqlTenantLocales}
          }
        }
        participationLevels {
          id
          titleMultiloc {
            ${graphqlTenantLocales}
          }
        }
        phases {
          ${graphqlTenantLocales}
        }
        purposes {
          id
          titleMultiloc {
            ${graphqlTenantLocales}
          }
        }
        titleMultiloc {
          ${graphqlTenantLocales}
        }
        subtitleMultiloc {
          ${graphqlTenantLocales}
        }
        descriptionMultilocs {
          content
          locale
        }
        successCases {
          id
          href
          image
        }
      }
    }
  `;

    const { loading, data } = useQuery(TEMPLATE_QUERY, { client });

    const copyLink = useCallback(() => {
      clipboard.writeText(
        `${window.location.origin}/templates/${projectTemplateId}`
      );
      setLinkCopied(true);
      trackEventByName(tracks.linkCopied, { projectTemplateId });
    }, [projectTemplateId]);

    useEffect(() => {
      if (linkCopied) {
        setTimeout(() => setLinkCopied(false), 2000);
      }
    }, [linkCopied]);

    return (
      <Container className={className}>
        {loading && (
          <Centerer height="500px">
            <Spinner />
          </Centerer>
        )}

        {!loading && data && (
          <>
            <Header>
              <HeaderLeft>
                <Title>
                  <T value={data.projectTemplate.titleMultiloc} />
                </Title>
                <Subtitle>
                  <T value={data.projectTemplate.subtitleMultiloc} />
                </Subtitle>
              </HeaderLeft>

              <HeaderRight>
                <LinkCopied className={linkCopied ? 'visible' : 'hidden'}>
                  <LinkCopiedIcon name="check" />
                  <FormattedMessage {...messages.copied} />
                </LinkCopied>
                <CopyLinkButton
                  onClick={copyLink}
                  icon="link"
                  buttonStyle="secondary-outlined"
                >
                  <FormattedMessage {...messages.copyLink} />
                </CopyLinkButton>
              </HeaderRight>
            </Header>

            <MetaInfo>
              <MetaInfoLeft>
                {data.projectTemplate.departments &&
                  data.projectTemplate.departments.map((department) => (
                    <Department key={department.id}>
                      <T value={department.titleMultiloc} />
                    </Department>
                  ))}
              </MetaInfoLeft>
              <MetaInfoRight>
                {data.projectTemplate.purposes &&
                  data.projectTemplate.purposes.length > 0 && (
                    <MetaInfoRightBox>
                      <MetaInfoRightBoxIcon name="bullseye" />
                      <MetaInfoRightBoxText>
                        {data.projectTemplate.purposes
                          .map((purpose) => localize(purpose.titleMultiloc))
                          .join(', ')}
                      </MetaInfoRightBoxText>
                    </MetaInfoRightBox>
                  )}
                {data.projectTemplate.participationLevels &&
                  data.projectTemplate.participationLevels.length > 0 && (
                    <MetaInfoRightBox className="last">
                      <MetaInfoRightBoxIcon name="participation-level" />
                      <MetaInfoRightBoxText>
                        {data.projectTemplate.participationLevels
                          .map((participationLevel) =>
                            localize(participationLevel.titleMultiloc)
                          )
                          .join(', ')}
                      </MetaInfoRightBoxText>
                    </MetaInfoRightBox>
                  )}
              </MetaInfoRight>
            </MetaInfo>

            <Content>
              {data.projectTemplate.headerImage && (
                <HeaderImage src={data.projectTemplate.headerImage} />
              )}

              <QuillEditedContent textColor={colors.primary}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: localize(data.projectTemplate.descriptionMultilocs),
                  }}
                />
              </QuillEditedContent>
            </Content>

            {data.projectTemplate.phases &&
              data.projectTemplate.phases.length > 0 && (
                <Phases>
                  {data.projectTemplate.phases.map((phase, index) => (
                    <PhaseContainer
                      key={index}
                      className={`${index === 0 ? 'first' : ''} ${
                        index === data.projectTemplate.phases.length - 1
                          ? 'last'
                          : ''
                      }`}
                    >
                      <PhaseBar>
                        {index + 1}
                        <PhaseArrow />
                      </PhaseBar>
                      <PhaseText>
                        <T value={phase} />
                      </PhaseText>
                    </PhaseContainer>
                  ))}
                </Phases>
              )}

            {data.projectTemplate.successCases &&
              data.projectTemplate.successCases.length > 0 && (
                <Footer>
                  <SuccessCasesTitle>
                    <FormattedMessage {...messages.alsoUsedIn} />
                  </SuccessCasesTitle>
                  <SuccessCases>
                    {data.projectTemplate.successCases.map((successCase) => (
                      <SuccessCase
                        key={successCase.id}
                        href={successCase.href}
                        target="_blank"
                      >
                        <SuccessCaseImage src={successCase.image} />
                      </SuccessCase>
                    ))}
                  </SuccessCases>
                </Footer>
              )}
          </>
        )}
      </Container>
    );
  }
);

export default ProjectTemplatePreview;

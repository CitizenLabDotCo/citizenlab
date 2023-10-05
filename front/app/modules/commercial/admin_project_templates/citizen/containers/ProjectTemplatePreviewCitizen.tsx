import React, { memo } from 'react';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import clHistory from 'utils/cl-router/history';

// components
import ProjectTemplatePreview from '../../components/ProjectTemplatePreview';
import { Icon } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

// resources
import useAuthUser from 'api/me/useAuthUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../admin/containers/messages';

// styling
import styled from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  width: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  justify-content: center;
  padding: 50px;
  background: ${colors.background};

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}

  ${media.phone`
    padding: 20px;
  `}
`;

const ContainerInner = styled.div`
  width: 100%;
  max-width: 1050px;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const InfoboxContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 27px;
  margin-bottom: 25px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.teal100};
`;

const InfoboxIcon = styled(Icon)`
  flex: 0 0 31px;
  width: 31px;
  height: 31px;
  fill: #80cfd8;
  padding: 0px;
  margin: 0px;
  margin-right: 27px;
`;

const InfoboxText = styled.div`
  color: ${colors.teal700};
  font-size: ${fontSizes.base}px;
  line-height: 21px;
  font-weight: 400;
  display: flex;
  flex-direction: column;

  p {
    margin: 0;
    padding: 0;
  }

  a {
    color: ${colors.teal700};
    font-weight: 400;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.15, colors.teal700)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 600;
  }
`;

export interface Props {
  className?: string;
}

const ProjectTemplatePreviewCitizen = memo<Props & WithRouterProps>(
  ({ params, className }) => {
    const { data: authUser } = useAuthUser();
    const projectTemplateId: string | undefined = get(
      params,
      'projectTemplateId'
    );

    if (projectTemplateId) {
      if (!isNilOrError(authUser) && isAdmin(authUser)) {
        clHistory.push(`/admin/projects/templates/${projectTemplateId}`);
      } else {
        const link = (
          <a
            href="mailto:support@citizenlab.co"
            target="_blank"
            rel="noreferrer"
          >
            <FormattedMessage {...messages.citizenlabExpert} />
          </a>
        );

        return (
          <Container className={className || ''}>
            <ContainerInner>
              <InfoboxContainer className={className}>
                <InfoboxIcon name="key" />
                <InfoboxText>
                  <p>
                    <strong>
                      <FormattedMessage {...messages.infoboxLine1} />
                    </strong>
                  </p>
                  <p>
                    <FormattedMessage
                      {...messages.infoboxLine2}
                      values={{ link }}
                    />
                  </p>
                </InfoboxText>
              </InfoboxContainer>

              <ProjectTemplatePreview projectTemplateId={projectTemplateId} />
            </ContainerInner>
          </Container>
        );
      }
    }

    return null;
  }
);

export default withRouter(ProjectTemplatePreviewCitizen);

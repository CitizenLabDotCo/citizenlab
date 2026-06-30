import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

import { ICustomPageData } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useDeleteCustomPage from 'api/custom_pages/useDeleteCustomPage';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { List, Row, TextCell } from 'components/admin/ResourceList';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';

const ProjectPagesList = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const { data: pages } = useCustomPages({ projectId });
  const { mutate: deletePage } = useDeleteCustomPage();

  if (!project || !pages) {
    return null;
  }

  const projectSlug = project.data.attributes.slug;

  const handleDelete = (page: ICustomPageData) => () => {
    if (window.confirm(formatMessage(messages.deleteConfirmation))) {
      deletePage(page.id);
    }
  };

  return (
    <Box mb="40px" p="44px">
      <Box bg={colors.white} borderRadius={stylingConsts.borderRadius} p="44px">
        <SectionTitle>{formatMessage(messages.pagesTitle)}</SectionTitle>
        <SectionDescription>
          {formatMessage(messages.pagesDescription)}
        </SectionDescription>
        <Box display="flex" mb="40px">
          <ButtonWithLink
            buttonStyle="admin-dark"
            icon="plus-circle"
            to="/admin/projects/$projectId/pages/new"
            params={{ projectId }}
            data-cy="e2e-add-project-page"
          >
            {formatMessage(messages.newPageButton)}
          </ButtonWithLink>
        </Box>

        {pages.data.length === 0 ? (
          <SectionDescription>
            {formatMessage(messages.noPages)}
          </SectionDescription>
        ) : (
          <List>
            {pages.data.map((page) => (
              <Row key={page.id} id={page.id}>
                <TextCell className="expand">
                  {localize(page.attributes.title_multiloc)}
                </TextCell>
                <ButtonWithLink
                  buttonStyle="secondary-outlined"
                  icon="eye"
                  openLinkInNewTab
                  to="/projects/$slug/pages/$pageSlug"
                  params={{ slug: projectSlug, pageSlug: page.attributes.slug }}
                >
                  {formatMessage(messages.viewPage)}
                </ButtonWithLink>
                <ButtonWithLink
                  buttonStyle="secondary-outlined"
                  icon="edit"
                  to="/admin/projects/$projectId/pages/$customPageId"
                  params={{ projectId, customPageId: page.id }}
                >
                  {formatMessage(messages.editButton)}
                </ButtonWithLink>
                <ButtonWithLink
                  buttonStyle="text"
                  icon="delete"
                  onClick={handleDelete(page)}
                >
                  {formatMessage(messages.deleteButton)}
                </ButtonWithLink>
              </Row>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default ProjectPagesList;

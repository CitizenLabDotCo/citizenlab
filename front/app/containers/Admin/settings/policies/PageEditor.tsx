import React, { useState } from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import PageForm, { FormValues } from 'components/PageForm';

// services
import { updateCustomPage } from 'services/customPages';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';
import { updatePage } from 'services/pages';

// hooks
import useRemoteFiles, { RemoteFiles } from 'hooks/useRemoteFiles';
import useCustomPage from 'hooks/useCustomPage';

// utils
import { isNilOrError } from 'utils/helperUtils';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const timeout = 350;

const EditorWrapper = styled.div`
  margin-bottom: 35px;

  &:last-child {
    margin-bottom: 0px;
  }
`;

const DeployIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 12px;
  transition: transform 200ms ease-out;
  transform: rotate(0deg);
`;

const Toggle = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &:hover,
  &.deployed {
    color: ${colors.primary};

    ${DeployIcon} {
      fill: ${colors.primary};
    }
  }

  &.deployed {
    ${DeployIcon} {
      transform: rotate(90deg);
    }
  }
`;

const EditionForm = styled.div`
  overflow: hidden;
  transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
  margin-top: 15px;
  max-width: 830px;

  &.page-enter {
    max-height: 0px;

    &.page-enter-active {
      max-height: 1000vh;
    }
  }

  &.page-exit {
    max-height: 1000vh;

    &.page-exit-active {
      max-height: 0px;
    }
  }
`;

interface Props {
  className?: string;
  pageSlug: string;
}

const PageEditor = ({ className, pageSlug }: Props) => {
  const page = useCustomPage({ customPageSlug: pageSlug });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });

  const [expanded, setExpanded] = useState(false);
  const toggleDeploy = () => {
    setExpanded((expanded) => !expanded);
  };

  const handleSubmit =
    (pageId: string, remotePageFiles: RemoteFiles) =>
    async ({
      slug,
      title_multiloc,
      top_info_section_multiloc,
      local_page_files,
    }: FormValues) => {
      const fieldValues = { slug, title_multiloc, top_info_section_multiloc };
      await updateCustomPage(pageId, fieldValues);

      if (!isNilOrError(local_page_files)) {
        handleAddPageFiles(pageId, local_page_files, remotePageFiles);
        handleRemovePageFiles(pageId, local_page_files, remotePageFiles);
      }
    };

  if (!isNilOrError(page)) {
    const pageId = page.id;
    return (
      <EditorWrapper
        className={`${className} e2e-page-editor editor-${pageSlug}`}
      >
        <Toggle onClick={toggleDeploy} className={`${expanded && 'deployed'}`}>
          <DeployIcon name="chevron-right" />
          {messages[pageSlug] ? (
            <FormattedMessage {...messages[pageSlug]} />
          ) : (
            pageSlug
          )}
        </Toggle>

        <CSSTransition
          in={expanded}
          timeout={timeout}
          mountOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={true}
          classNames="page"
        >
          <EditionForm>
            <PageForm
              pageId={pageId}
              defaultValues={{
                nav_bar_item_title_multiloc:
                  page.attributes.nav_bar_item_title_multiloc,
                title_multiloc: page.attributes.title_multiloc,
                top_info_section_multiloc:
                  page.attributes.top_info_section_multiloc,
                slug: page.attributes.slug,
                local_page_files: remotePageFiles,
              }}
              hideSlugInput
              onSubmit={handleSubmit(pageId, remotePageFiles)}
            />
          </EditionForm>
        </CSSTransition>
      </EditorWrapper>
    );
  }

  return null;
};

export default PageEditor;

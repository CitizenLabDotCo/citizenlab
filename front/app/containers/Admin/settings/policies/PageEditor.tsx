import React, { useEffect, useState } from 'react';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
import PageForm, { FormValues } from 'components/PageForm';

// api
import { handleAddPageFiles, handleRemovePageFiles } from 'api/page_files/util';
import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

// utils
import { isNilOrError } from 'utils/helperUtils';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// styling
import styled from 'styled-components';
import useAddPagesFile from 'api/page_files/useAddPageFile';
import useDeletePageFile from 'api/page_files/useDeletePageFile';
import usePageFiles from 'api/page_files/usePageFiles';
import { UploadFile } from 'typings';
import { convertUrlToUploadFile } from 'utils/fileUtils';

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
  const { mutateAsync: addPageFile } = useAddPagesFile();
  const { mutateAsync: deletePageFile } = useDeletePageFile();
  const { data: page } = useCustomPageBySlug(pageSlug);
  const { mutateAsync: updateCustomPage } = useUpdateCustomPage();
  const { data: remotePageFiles } = usePageFiles(
    isNilOrError(page) ? undefined : page.data.id
  );

  const [files, setFiles] = React.useState<UploadFile[]>([]);

  useEffect(() => {
    async function getFiles() {
      let files: UploadFile[] = [];

      if (remotePageFiles) {
        files = (await Promise.all(
          remotePageFiles.data.map(async (file) => {
            const uploadFile = convertUrlToUploadFile(
              file.attributes.file.url,
              file.id,
              file.attributes.name
            );
            return uploadFile;
          })
        )) as UploadFile[];
      }
      setFiles(files);
    }

    getFiles();
  }, [remotePageFiles]);

  const [expanded, setExpanded] = useState(false);
  const toggleDeploy = () => {
    setExpanded((expanded) => !expanded);
  };

  const handleSubmit =
    (pageId: string, remotePageFiles: UploadFile[] | null) =>
    async ({
      title_multiloc,
      top_info_section_multiloc,
      local_page_files,
    }: FormValues) => {
      const fieldValues = { title_multiloc, top_info_section_multiloc };
      await updateCustomPage({ id: pageId, ...fieldValues });

      if (!isNilOrError(local_page_files)) {
        handleAddPageFiles(
          pageId,
          local_page_files,
          remotePageFiles,
          addPageFile
        );
        handleRemovePageFiles(
          pageId,
          local_page_files,
          remotePageFiles,
          deletePageFile
        );
      }
    };

  if (!isNilOrError(page)) {
    const pageId = page.data.id;
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
                  page.data.attributes.nav_bar_item_title_multiloc,
                title_multiloc: page.data.attributes.title_multiloc,
                top_info_section_multiloc:
                  page.data.attributes.top_info_section_multiloc,
                local_page_files: files,
              }}
              onSubmit={handleSubmit(pageId, files)}
            />
          </EditionForm>
        </CSSTransition>
      </EditorWrapper>
    );
  }

  return null;
};

export default PageEditor;

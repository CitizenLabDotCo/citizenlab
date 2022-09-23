import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import PageWrapper from 'components/admin/PageWrapper';
import PageForm, { FormValues } from 'components/PageForm';
import T from 'components/T';
import GoBackButton from 'components/UI/GoBackButton';

// utils
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';

// services
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';
import { IPageData, updatePage } from 'services/pages';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import usePage from 'hooks/usePage';
import useRemoteFiles, { RemoteFiles } from 'hooks/useRemoteFiles';

const Title = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  padding: 0;
  width: 100%;
  margin: 1rem 0 3rem 0;
`;

const EditPageForm = ({ params: { pageId } }: WithRouterProps) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const page = usePage({ pageId });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });
  const getInitialValues = (page: IPageData, remotePageFiles: RemoteFiles) => ({
    title_multiloc: page.attributes.title_multiloc,
    body_multiloc: page.attributes.body_multiloc,
    slug: page.attributes.slug,
    local_page_files: remotePageFiles,
  });

  const handleSubmit =
    (page: IPageData, remotePageFiles: RemoteFiles) =>
    async (values: FormValues) => {
      const localPageFiles = values.local_page_files;
      const pageId = page.id;

      await updatePage(pageId, values);
      if (!isNilOrError(localPageFiles)) {
        handleAddPageFiles(pageId, localPageFiles, remotePageFiles);
        handleRemovePageFiles(pageId, localPageFiles, remotePageFiles);
      }
    };

  const handleGoBack = () => {
    clHistory.push('/admin/pages');
  };

  if (!isNilOrError(page) && !isNilOrError(appConfigurationLocales)) {
    return (
      <div>
        <GoBackButton onClick={handleGoBack} />
        <Title>
          <T value={page.attributes.title_multiloc} />
        </Title>
        <PageWrapper>
          <PageForm
            pageId={pageId}
            onSubmit={handleSubmit(page, remotePageFiles)}
            defaultValues={getInitialValues(page, remotePageFiles)}
          />
        </PageWrapper>
      </div>
    );
  }

  return null;
};

export default withRouter(EditPageForm);

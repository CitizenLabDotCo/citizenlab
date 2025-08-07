import React, { useEffect, useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';
import useProjectImports from 'api/project_imports/useProjectImports';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import { isSuperAdmin } from 'utils/permissions/roles';

import ImportZipModal from './ImportZipModal';

const ProjectImporter = () => {
  const { data: authUser } = useAuthUser();

  const isFeatureEnabled = useFeatureFlag({
    name: 'project_importer',
  });

  const [searchParams] = useSearchParams();
  const importId = searchParams.get('id') || undefined;
  const numProjects = searchParams.get('num_projects') || undefined;
  const isPreview = searchParams.get('preview') === 'true';

  const [importZipModalOpen, setImportZipModalOpen] = useState(false);
  const openImportZipModal = () => setImportZipModalOpen(true);
  const closeImportZipModal = () => setImportZipModalOpen(false);

  const [isImporting, setIsImporting] = useState(false);
  const { data: projectImports } = useProjectImports(
    { importId },
    { pollingEnabled: isImporting }
  );
  const localize = useLocalize();

  useEffect(() => {
    const numImportJobs = isPreview ? 1 : parseInt(numProjects || '0', 10);
    if (projectImports?.data?.length < numImportJobs) {
      setIsImporting(true);
    } else {
      setIsImporting(false);
    }
  }, [projectImports, numProjects, isPreview]);

  const setImportData = (data) => {
    clHistory.push(
      `/admin/project-importer?id=${data.id}&num_projects=${data.attributes.projects_to_import}&preview=${data.attributes.preview}` as any
    ); // TODO: Sort out types
  };

  // This feature is only for super admins when the feature flag is enabled
  if (!(isFeatureEnabled && isSuperAdmin(authUser))) {
    return <h1>Not allowed</h1>;
  }

  return (
    <Box>
      <h1>Project import</h1>
      <p>
        This is the hidden project import page. Save the ID in the URL if you
        want to find this import back again.
      </p>

      <Button
        width="100px"
        disabled={isImporting}
        onClick={openImportZipModal}
        processing={isImporting}
      >
        Import
      </Button>

      {isImporting ? (
        <p>
          {isPreview ? 'Previewing' : 'Importing'}:{' '}
          {projectImports?.data?.length + 1} / {numProjects}
        </p>
      ) : (
        <p>
          {isPreview ? 'Previewed' : 'Imported'}: {projectImports?.data?.length}{' '}
          projects
        </p>
      )}

      {projectImports?.data?.map((importedProject) => {
        const projectTitle =
          localize(importedProject.attributes.project_title_multiloc) ||
          (isPreview ? 'IMPORT PREVIEW' : 'DELETED PROJECT');
        const projectPath = importedProject.attributes.project_id
          ? (`/admin/projects/${importedProject.attributes.project_id}` as any) // TODO: Sort out types
          : undefined;
        return (
          <Box key={importedProject.id}>
            <h3>
              {projectPath ? (
                <Link to={projectPath} target="_blank">
                  {projectTitle}
                  <Text display="inline" fontSize="xs">
                    - {importedProject.attributes.created_at}
                  </Text>
                </Link>
              ) : (
                projectTitle
              )}
            </h3>
            <ul>
              {importedProject.attributes.log.map((logLine, index) => {
                return <li key={index}>{logLine}</li>;
              })}
            </ul>
            <hr />
          </Box>
        );
      })}
      <ImportZipModal
        open={importZipModalOpen}
        onClose={closeImportZipModal}
        onImport={(data) => setImportData(data)}
      />
    </Box>
  );
};
export default ProjectImporter;

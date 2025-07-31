import React, { useEffect, useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useProjectImports from 'api/project_imports/useProjectImports';

import useLocalize from 'hooks/useLocalize';

import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

import ImportZipModal from './ImportZipModal';
import { isSuperAdmin } from 'utils/permissions/roles';
import useAuthUser from 'api/me/useAuthUser';

const ProjectImporter = () => {
  const { data: authUser } = useAuthUser();
  const [searchParams] = useSearchParams();
  const importId = searchParams.get('id') || undefined;
  const numProjects = searchParams.get('num_projects') || undefined;

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
    if (numProjects && projectImports?.data?.length < parseInt(numProjects)) {
      setIsImporting(true);
    } else {
      setIsImporting(false);
    }
  }, [projectImports, numProjects]);

  const setImportData = (data) => {
    clHistory.push(
      `/admin/project-importer?id=${data.id}&num_projects=${data.attributes.projects_to_import}` as any
    ); // TODO: Sort out types
  };

  // This feature is only for super admins
  if (!isSuperAdmin(authUser)) return null;

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
          Importing: {projectImports?.data?.length + 1} / {numProjects}
        </p>
      ) : (
        <p>Imported: {projectImports?.data?.length} projects</p>
      )}

      {projectImports?.data?.map((importedProject) => {
        const projectTitle =
          localize(importedProject.attributes.project_title_multiloc) ||
          'DELETED PROJECT';
        const projectPath = importedProject.attributes.project_id
          ? (`/admin/projects/${importedProject.attributes.project_id}` as any) // TODO: Sort out types
          : undefined;
        return (
          <Box key={importedProject.id}>
            <h3>
              {projectPath ? (
                <Link to={projectPath} target="_blank">
                  {projectTitle} -
                  <Text display="inline" fontSize="xs">
                    {importedProject.attributes.created_at}
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

      {/* <h2>Previous imports</h2>*/}
      {/* <ul>*/}
      {/*  <li>Date - 10 projects - ID</li>*/}
      {/* </ul>*/}
    </Box>
  );
};
export default ProjectImporter;

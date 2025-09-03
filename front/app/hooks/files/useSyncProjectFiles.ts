import { useCallback } from 'react';

import { isString } from 'lodash-es';

import useAddFileAttachment from 'api/file_attachments/useAddFileAttachment';
import projectFilesKeys from 'api/project_files/keys';
import useAddProjectFile from 'api/project_files/useAddProjectFile';
import useDeleteProjectFile from 'api/project_files/useDeleteProjectFile';
import useUpdateProjectFile from 'api/project_files/useUpdateProjectFile';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { SyncProjectFilesArguments } from './types';

export function useSyncProjectFiles() {
  const { mutateAsync: addProjectFile } = useAddProjectFile();
  const { mutateAsync: addProjectFileAttachment } = useAddFileAttachment();
  const { mutateAsync: updateProjectFile } = useUpdateProjectFile();
  const { mutateAsync: deleteProjectFile } = useDeleteProjectFile();

  return useCallback(
    async ({
      projectId,
      projectFiles,
      filesToRemove,
      fileOrdering,
    }: SyncProjectFilesArguments) => {
      // First, create any File Attachments for existing files from File Library
      const filesToAttach = projectFiles.filter(
        (file) => !file.remote && file.id // Files with IDs that aren't remote yet are considered new attachments.
      );
      if (filesToAttach.length > 0) {
        const filesToAttachPromises = filesToAttach.map((file) =>
          addProjectFileAttachment({
            file_id: file.id || '',
            attachable_id: projectId,
            attachable_type: 'Project',
          }).then((attachment) => {
            // After attaching, also update the file's ordering
            return updateProjectFile({
              projectId,
              fileId: attachment.data.id,
              file: { ordering: file.ordering },
            });
          })
        );

        await Promise.all(filesToAttachPromises);
      }

      const filesToAddPromises = projectFiles
        .filter((file) => !file.remote && !file.id) // Newly uploaded files
        .map((file) =>
          addProjectFile({
            projectId,
            file: {
              file: file.base64,
              name: file.name,
              ordering: file.ordering,
            },
          })
        );

      const filesToRemovePromises = filesToRemove
        .filter((file) => file.remote && isString(file.id))
        .map((file) =>
          deleteProjectFile({
            projectId,
            fileId: file.id,
          })
        );

      const reorderedFiles = projectFiles.filter((file) => {
        const initialOrdering = file.id ? fileOrdering[file.id] : undefined;
        return (
          file.remote &&
          typeof file.ordering !== 'undefined' &&
          (typeof initialOrdering === 'undefined' ||
            file.ordering !== initialOrdering)
        );
      });

      const filesToReorderPromises = reorderedFiles.map((file) =>
        updateProjectFile({
          projectId,
          fileId: file.id || '',
          file: {
            ordering: file.ordering,
          },
        })
      );

      // Return a single promise that resolves when all mutations are done
      await Promise.all([
        ...filesToAddPromises,
        ...filesToRemovePromises,
        ...filesToReorderPromises,
      ]);

      // Refresh the data
      await queryClient.invalidateQueries({
        queryKey: projectFilesKeys.list({ projectId }),
      });
    },
    [
      addProjectFile,
      addProjectFileAttachment,
      deleteProjectFile,
      updateProjectFile,
    ]
  );
}

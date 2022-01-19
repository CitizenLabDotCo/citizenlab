import { createUseAdminPublications } from 'hooks/useAdminPublications';

declare module 'hooks/useAdminPublications' {
  export interface BaseProps {
    /**
     * childrenOfId is an id of a folder that we want
     * child admin publications of.
     * Folders are the only admin publication type that can have
     * children at the moment.
     * Their children can only be projects at the moment.
     */
    childrenOfId?: string;
  }
}

const getRemainingQueryParameters = ({ childrenOfId }) => ({
  folder: childrenOfId,
});

const useAdminPublications = createUseAdminPublications(
  getRemainingQueryParameters
);
export default useAdminPublications;

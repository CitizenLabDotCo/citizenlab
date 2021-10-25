import { useEffect, useState, useCallback } from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

// typings
import { PublicationStatus } from 'services/projects';
import { listAdminPublications } from 'services/adminPublications';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  areas?: string[];
  publicationStatuses: PublicationStatus[];
}

interface ChildrenOfProps {
  id?: string;
}

export default function useAdminPublicationChildren({
  areas,
  publicationStatuses,
}: Props) {
  const [all, setAll] = useState<IAdminPublicationContent[] | undefined | null>(
    undefined
  );

  useEffect(() => {
    const queryParameters = {
      areas,
      publication_statuses: publicationStatuses,
    };

    const subscription = listAdminPublications({ queryParameters })
      .observable.pipe(distinctUntilChanged())
      .subscribe((adminPublications) => {
        const receivedItems = adminPublications.data
          .map((adminPublication) => {
            const publicationType =
              adminPublication.relationships.publication.data.type;
            const publicationId =
              adminPublication.relationships.publication.data.id;

            return {
              publicationId,
              publicationType,
              id: adminPublication.id,
              relationships: adminPublication.relationships,
              attributes: {
                ...adminPublication.attributes,
              },
            };
          })
          .filter((item) => item) as IAdminPublicationContent[];

        setAll(receivedItems);
      });

    return () => subscription.unsubscribe();
  }, [areas, publicationStatuses]);

  const childrenOf = useCallback(
    ({ id: publicationId }: ChildrenOfProps) => {
      if (isNilOrError(all)) {
        return [];
      }

      return all.filter(
        (publication) =>
          !isNilOrError(publication.relationships.parent.data) &&
          publication.relationships.parent.data.id === publicationId
      );
    },
    [all]
  );

  return childrenOf;
}

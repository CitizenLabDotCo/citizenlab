import { useEffect, useState } from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

// typings
import { PublicationStatus } from 'services/projects';
import { listAdminPublications } from 'services/adminPublications';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  publicationId?: string;
  areaFilter?: string[];
  publicationStatusFilter: PublicationStatus[];
}

export default function useAdminPublicationChildren({
  publicationId,
  areaFilter,
  publicationStatusFilter,
}: Props) {
  const [adminPublications, setAdminPublications] = useState<
    IAdminPublicationContent[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    if (!publicationId) return;

    const queryParameters = {
      areaFilter,
      publication_statuses: publicationStatusFilter,
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
          .filter((item) => item);

        if (isNilOrError(receivedItems)) {
          setAdminPublications(receivedItems);
        } else {
          setAdminPublications(getChildren(receivedItems, publicationId));
        }
      });

    return () => subscription.unsubscribe();
  }, [publicationId, areaFilter, publicationStatusFilter]);

  return adminPublications;
}

function getChildren(
  adminPublications: IAdminPublicationContent[],
  publicationId: string
) {
  return adminPublications.filter(
    (publication) =>
      !isNilOrError(publication.relationships.parent.data) &&
      publicationId === publication.relationships.parent.data.id
  );
}

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
  areas?: string[];
  publicationStatuses: PublicationStatus[];
}

export default function useAdminPublicationChildren({
  publicationId,
  areas,
  publicationStatuses,
}: Props) {
  const [adminPublications, setAdminPublications] = useState<
    IAdminPublicationContent[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    if (!publicationId) return;

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
        console.log('refiring subscription to adminPublications');

        if (isNilOrError(receivedItems)) {
          setAdminPublications(receivedItems);
        } else {
          setAdminPublications(getChildren(receivedItems, publicationId));
        }
      });

    return () => subscription.unsubscribe();
  }, [publicationId, areas, publicationStatuses]);

  return adminPublications;
}

function getChildren(adminPublications, publicationId) {
  return adminPublications.filter(
    (publication) =>
      !isNilOrError(publication.relationships.parent.data) &&
      publicationId === publication.relationships.parent.data.id
  );
}

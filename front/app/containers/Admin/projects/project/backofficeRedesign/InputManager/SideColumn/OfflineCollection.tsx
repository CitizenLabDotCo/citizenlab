import React, { ReactNode, useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import useAddIdea from 'api/ideas/useAddIdea';
import { IPhaseData } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import tracks from 'containers/Admin/projects/_shared/components/NewIdeaButton/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { useLocation } from 'utils/router';

import AddInputModal from '../../Phase/BuildPanel/BuildFields/MethodSection/AddInputModal';
import FullFormLink from '../../Phase/BuildPanel/BuildFields/MethodSection/FullFormLink';
import messages from '../messages';
import useInputTermLabels from '../useInputTermLabels';

import { actionRowProps } from './actionRowProps';
import Card from './Card';
import OfflineFormsButton from './OfflineFormsButton';

interface Props {
  phase: IPhaseData;
  /** Further actions, listed after the offline ones. */
  children?: ReactNode;
  /** Off when another card follows and takes the remaining height. */
  fillHeight?: boolean;
}

const OfflineCollection = ({ phase, children, fillHeight = true }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { term, terms } = useInputTermLabels();
  const [addOpened, setAddOpened] = useState(false);
  const { mutateAsync: addIdea } = useAddIdea();
  const { data: project } = useProjectById(phase.relationships.project.data.id);
  const addLabel = formatMessage(messages.newTerm, { term });

  return (
    <Card fillHeight={fillHeight}>
      <Button
        {...actionRowProps}
        icon="plus"
        onClick={() => {
          trackEventByName(tracks.clickNewIdea.name, {
            pathnameFrom: pathname,
          });
          setAddOpened(true);
        }}
      >
        {addLabel}
      </Button>
      <OfflineFormsButton
        participationMethod={phase.attributes.participation_method}
        label={formatMessage(messages.importPaperTerms, { terms })}
        buttonProps={{ ...actionRowProps, icon: 'upload-file' }}
      />
      {children}
      {addOpened && (
        <AddInputModal
          phaseId={phase.id}
          kind="input"
          header={addLabel}
          fullFormLink={
            project && (
              <FullFormLink
                to="/projects/$slug/ideas/new"
                params={{ slug: project.data.attributes.slug }}
                search={{ phase_id: phase.id }}
              />
            )
          }
          onSubmit={(values) =>
            addIdea({
              phaseId: phase.id,
              requestBody: { ...values, publication_status: 'published' },
            })
          }
          onClose={() => setAddOpened(false)}
        />
      )}
    </Card>
  );
};

export default OfflineCollection;

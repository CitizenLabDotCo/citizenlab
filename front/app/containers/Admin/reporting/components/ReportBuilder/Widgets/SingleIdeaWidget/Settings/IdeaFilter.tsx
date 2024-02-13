import React, { useMemo } from 'react';

// hooks
import useIdeas from 'api/ideas/useIdeas';

// components
import { Box, Select, Spinner, Text } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize from 'hooks/useLocalize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IOption } from 'typings';

interface Props {
  label: string;
  phaseId: string;
  ideaId?: string;
  onIdeaFilter: (filter: IOption) => void;
}

// Inspired by front/app/containers/Admin/reporting/components/ReportBuilder/Widgets/_shared/PhaseFilter.tsx
const IdeaFilter = ({ label, phaseId, ideaId, onIdeaFilter }: Props) => {
  const { data: ideasData } = useIdeas(
    { phase: phaseId },
    { enabled: !!phaseId }
  );
  const localize = useLocalize();
  const ideas = ideasData?.data;

  const ideaOptions = useMemo(() => {
    return ideas
      ? ideas.map(({ id, attributes }) => ({
          value: id,
          label: localize(attributes.title_multiloc),
        }))
      : null;
  }, [ideas, localize]);

  if (!ideaOptions) {
    return (
      <Box mb="20px">
        <Spinner />
      </Box>
    );
  }

  if (ideaOptions.length === 0) {
    return (
      <Box mb="20px">
        <Text color="red600">
          <FormattedMessage {...messages.noIdeaAvailable} />
        </Text>
      </Box>
    );
  }

  return (
    <Box width="100%" mb="20px">
      <Select
        label={label}
        onChange={onIdeaFilter}
        value={ideaId}
        options={ideaOptions}
      />
    </Box>
  );
};

export default IdeaFilter;

import React from 'react';

import { Box, Radio } from '@citizenlab/cl2-component-library';

import useSpaces from 'api/spaces/useSpaces';

import SpaceSelect from 'components/admin/SpaceSelectSection/SpaceSelect';

import { FormattedMessage } from 'utils/cl-intl';

import { LabelHeaderDescription } from '../../../labels';
import messages from '../messages';
import { Props } from '../types';

const SpaceRadio = ({
  projectContext,
  onSetContext,
  space_id,
  onChangeSpace,
}: Props) => {
  const { data: spaces } = useSpaces();
  if (!spaces) return null;

  return (
    <>
      <Radio
        name="space"
        value="space"
        currentValue={projectContext}
        label={
          <LabelHeaderDescription
            header={<FormattedMessage {...messages.space} />}
            description={
              <FormattedMessage {...messages.spaceDescriptionChangeLater} />
            }
          />
        }
        onChange={() => onSetContext('space')}
        mb="12px"
      />
      {projectContext === 'space' && (
        <Box mb="40px">
          <SpaceSelect
            spaceId={space_id}
            spaces={spaces.data}
            onChange={(space_id) => {
              onChangeSpace(space_id);
            }}
          />
        </Box>
      )}
    </>
  );
};

export default SpaceRadio;

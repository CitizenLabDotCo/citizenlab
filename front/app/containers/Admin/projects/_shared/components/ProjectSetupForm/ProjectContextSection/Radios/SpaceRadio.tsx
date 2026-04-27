import React from 'react';

import { Box, Error, Radio } from '@citizenlab/cl2-component-library';

import useSpaces from 'api/spaces/useSpaces';

import SpaceSelect from 'components/admin/SpaceSelectSection/SpaceSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { LabelHeaderDescription } from '../../../labels';
import messages from '../messages';
import { Props } from '../types';

const SpaceRadio = ({
  projectContext,
  space_id,
  error,
  onSetContext,
  onChangeSpace,
}: Props) => {
  const { formatMessage } = useIntl();
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
            description={<FormattedMessage {...messages.spaceDescription} />}
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
      {error && <Error text={formatMessage(messages.spaceError)} />}
    </>
  );
};

export default SpaceRadio;

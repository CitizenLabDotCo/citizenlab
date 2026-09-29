import React from 'react';

import {
  Box,
  colors,
  Image,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import useIdeaFiles from 'api/idea_files/useIdeaFiles';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import { IIdeaData } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import previewMessages from 'components/admin/PostManager/components/PostPreview/messages';
import Body from 'components/PostShowComponents/Body';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import FileAttachments from 'components/UI/FileAttachments';

import { useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';
import { getAddressOrFallbackDMS } from 'utils/map';

interface Props {
  idea: IIdeaData;
}

const IdeaContent = ({ idea }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: images } = useIdeaImages(idea.id);
  const { data: files } = useIdeaFiles(idea.id);
  const { attributes } = idea;
  const image = images?.data[0]?.attributes.versions.large;
  const position = attributes.location_point_geojson;
  const address = getAddressOrFallbackDMS(
    attributes.location_description,
    attributes.location_point_geojson
  );

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      {image && (
        <Image
          src={image}
          alt=""
          width="100%"
          borderRadius={stylingConsts.borderRadius}
          border={`1px solid ${colors.divider}`}
        />
      )}
      {attributes.proposed_budget && (
        <Box>
          <Text m="0" fontSize="s" color="coolGrey600">
            {formatMessage(previewMessages.proposedBudgetTitle)}
          </Text>
          <Text m="0" fontWeight="bold">
            <FormattedBudget value={attributes.proposed_budget} />
          </Text>
        </Box>
      )}
      <Body postId={idea.id} body={localize(attributes.body_multiloc)} />
      {position && address && (
        <DropdownMap
          address={address}
          position={position}
          projectId={idea.relationships.project.data.id}
        />
      )}
      {files && files.data.length > 0 && <FileAttachments files={files.data} />}
    </Box>
  );
};

export default IdeaContent;

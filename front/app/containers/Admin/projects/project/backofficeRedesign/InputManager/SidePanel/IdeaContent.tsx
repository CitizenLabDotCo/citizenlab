import React from 'react';

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

import styles from './SidePanel.module.css';

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
    <div className={styles.ideaContent}>
      {image && <img src={image} alt="" className={styles.image} />}
      {attributes.proposed_budget && (
        <div>
          <p className={styles.secondary}>
            {formatMessage(previewMessages.proposedBudgetTitle)}
          </p>
          <p className={styles.budget}>
            <FormattedBudget value={attributes.proposed_budget} />
          </p>
        </div>
      )}
      <Body
        postId={idea.id}
        body={localize(attributes.body_multiloc)}
        fontSize="s"
      />
      {position && address && (
        <DropdownMap
          address={address}
          position={position}
          projectId={idea.relationships.project.data.id}
        />
      )}
      {files && files.data.length > 0 && <FileAttachments files={files.data} />}
    </div>
  );
};

export default IdeaContent;

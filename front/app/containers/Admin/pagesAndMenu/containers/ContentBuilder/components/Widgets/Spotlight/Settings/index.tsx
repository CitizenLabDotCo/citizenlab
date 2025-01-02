import React from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import PublicationSelect from './PublicationSelect';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    publicationId,
    titleMultiloc,
    descriptionMultiloc,
    buttonTextMultiloc,
    hideAvatars,
  } = useNode((node) => ({
    publicationId: node.data.props.publicationId,
    publicationType: node.data.props.publicationType,
    titleMultiloc: node.data.props.titleMultiloc,
    descriptionMultiloc: node.data.props.descriptionMultiloc,
    buttonTextMultiloc: node.data.props.buttonTextMultiloc,
    hideAvatars: node.data.props.hideAvatars,
  }));

  return (
    <Box mt="48px" mb="20px">
      <Box mb="20px">
        <PublicationSelect
          publicationId={publicationId}
          onSelect={(adminPublication) => {
            const relationship =
              adminPublication.relationships.publication.data;
            const publicationId = relationship.id;
            const publicationType = relationship.type;

            setProp((props) => {
              props.publicationId = publicationId;
              props.publicationType = publicationType;
              props.titleMultiloc =
                adminPublication.attributes.publication_title_multiloc;
              props.descriptionMultiloc =
                adminPublication.attributes.publication_description_preview_multiloc;
            });
          }}
        />
      </Box>
      <Box mb="20px">
        <InputMultilocWithLocaleSwitcher
          id="spotlight-title-multiloc"
          type="text"
          label={formatMessage(messages.title)}
          name="spotlight-title-multiloc"
          valueMultiloc={titleMultiloc}
          onChange={(valueMultiloc) =>
            setProp((props) => (props.titleMultiloc = valueMultiloc))
          }
        />
      </Box>
      <Box mb="20px">
        <QuillMutilocWithLocaleSwitcher
          maxHeight="240px"
          noImages
          noVideos
          id="spotlight-description-multiloc"
          valueMultiloc={descriptionMultiloc}
          label={formatMessage(messages.description)}
          onChange={(value) => {
            setProp((props) => (props.descriptionMultiloc = value));
          }}
        />
      </Box>
      <Box mb="20px">
        <InputMultilocWithLocaleSwitcher
          id="spotlight-button-text-multiloc"
          type="text"
          label={formatMessage(messages.buttonText)}
          name="spotlight-button-text-multiloc"
          valueMultiloc={buttonTextMultiloc}
          onChange={(valueMultiloc) =>
            setProp((props) => (props.buttonTextMultiloc = valueMultiloc))
          }
        />
      </Box>
      <Toggle
        checked={!hideAvatars}
        onChange={() =>
          setProp((props) => (props.hideAvatars = !props.hideAvatars))
        }
        label={formatMessage(messages.showAvatars)}
      />
    </Box>
  );
};

export default Settings;

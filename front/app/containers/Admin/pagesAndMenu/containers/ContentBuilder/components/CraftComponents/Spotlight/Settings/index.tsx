import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

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
  } = useNode((node) => ({
    publicationId: node.data.props.publicationId,
    publicationType: node.data.props.publicationType,
    titleMultiloc: node.data.props.titleMultiloc,
    descriptionMultiloc: node.data.props.descriptionMultiloc,
    buttonTextMultiloc: node.data.props.buttonTextMultiloc,
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
        <InputMultilocWithLocaleSwitcher
          id="spotlight-button-text-multiloc"
          type="text"
          label={formatMessage(messages.description)}
          name="spotlight-button-text-multiloc"
          valueMultiloc={descriptionMultiloc}
          onChange={(valueMultiloc) =>
            setProp((props) => (props.descriptionMultiloc = valueMultiloc))
          }
        />
      </Box>
      <Box>
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
    </Box>
  );
};

export default Settings;

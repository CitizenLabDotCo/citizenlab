import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import ProjectSelect from './ProjectSelect';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    projectId,
    titleMultiloc,
    descriptionMultiloc,
    buttonTextMultiloc,
  } = useNode((node) => ({
    projectId: node.data.props.projectId,
    titleMultiloc: node.data.props.titleMultiloc,
    descriptionMultiloc: node.data.props.descriptionMultiloc,
    buttonTextMultiloc: node.data.props.buttonTextMultiloc,
  }));

  return (
    <Box mt="48px" mb="20px">
      <Box mb="20px">
        <ProjectSelect
          projectId={projectId}
          onSelect={(adminPublication) => {
            const projectId =
              adminPublication.relationships.publication.data.id;
            setProp((props) => (props.projectId = projectId));
            setProp(
              (props) =>
                (props.titleMultiloc =
                  adminPublication.attributes.publication_title_multiloc)
            );
            setProp(
              (props) =>
                (props.descriptionMultiloc =
                  adminPublication.attributes.publication_description_preview_multiloc)
            );
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

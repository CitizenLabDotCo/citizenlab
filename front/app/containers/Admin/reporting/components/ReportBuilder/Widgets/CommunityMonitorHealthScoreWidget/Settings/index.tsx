import React, { useCallback } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { Props } from '../typings';

const Settings = () => {
  const {
    actions: { setProp },
    title,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    numberOfIdeas: node.data.props.numberOfIdeas,
    collapseLongText: node.data.props.collapseLongText,
  }));

  const setTitle = useCallback(
    (value: Multiloc) => {
      setProp((props: Props) => {
        props.title = value;
      });
    },
    [setProp]
  );

  return (
    <Box>
      {title}
      <Box mb="20px">
        <InputMultilocWithLocaleSwitcher
          label={'TITLE!'}
          type="text"
          valueMultiloc={title}
          onChange={setTitle}
        />
      </Box>
    </Box>
  );
};

export default Settings;

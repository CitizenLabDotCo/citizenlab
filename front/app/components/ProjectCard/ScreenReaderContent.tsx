import React from 'react';

import { IProject } from 'api/projects/types';

import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  project: IProject;
}

const ScreenReaderContent = ({ project }: Props) => (
  <ScreenReaderOnly>
    <>
      <FormattedMessage {...messages.a11y_projectTitle} />
      <T value={project.data.attributes.title_multiloc} />
    </>

    <>
      <FormattedMessage {...messages.a11y_projectDescription} />
      <T value={project.data.attributes.description_preview_multiloc} />
    </>
  </ScreenReaderOnly>
);

export default ScreenReaderContent;

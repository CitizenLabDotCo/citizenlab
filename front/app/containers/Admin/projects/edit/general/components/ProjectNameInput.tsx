import React from 'react';

// components
import { IconTooltip } from 'cl2-component-library';
import Error from 'components/UI/Error';
import { StyledSectionField, StyledInputMultiloc } from './styling';
import { SubSectionTitle } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IUpdatedProjectProperties } from 'services/projects';
import { Multiloc } from 'typings';

interface Props {
  projectAttrs: IUpdatedProjectProperties;
  titleError: Multiloc | null;
}

export default ({ projectAttrs, titleError }: Props) => (
  <StyledSectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.projectName} />
      <IconTooltip
        content={<FormattedMessage {...messages.titleLabelTooltip} />}
      />
    </SubSectionTitle>
    <StyledInputMultiloc
      id="project-title"
      type="text"
      valueMultiloc={projectAttrs.title_multiloc}
      label={<FormattedMessage {...messages.titleLabel} />}
      onChange={this.handleTitleMultilocOnChange}
      errorMultiloc={titleError}
    />
    <Error
      fieldName="title_multiloc"
      apiErrors={this.state.apiErrors.title_multiloc}
    />
  </StyledSectionField>
);

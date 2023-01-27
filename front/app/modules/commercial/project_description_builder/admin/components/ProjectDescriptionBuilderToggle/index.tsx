import React, { useEffect, useState } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// Typings
import { Locale, Multiloc } from 'typings';

// Style
import styled from 'styled-components';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useProjectDescriptionBuilderLayout from '../../../hooks/useProjectDescriptionBuilderLayout';

// Utils
import Link from 'utils/cl-router/Link';
import { fontSizes } from 'utils/styleUtils';

// Components
import { Toggle, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { addProjectDescriptionBuilderLayout } from 'modules/commercial/project_description_builder/services/projectDescriptionBuilder';

// Messages
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// Helpers
import { isNil, isNilOrError } from 'utils/helperUtils';

type ProjectDescriptionBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: Locale) => void;
  label: string;
  labelTooltipText: string;
  onMount: () => void;
} & WithRouterProps &
  WrappedComponentProps;

const StyledToggle = styled(Toggle)`
  margin-bottom: 30px;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-bottom: 30px;
`;

const StyledLink = styled(Link)`
  margin-top: -10px;
  font-size: ${fontSizes.base}px;
`;

const ProjectDescriptionBuilderToggle = ({
  params,
  intl: { formatMessage },
  valueMultiloc,
  onChange,
  label,
  labelTooltipText,
  onMount,
}: ProjectDescriptionBuilderToggleProps) => {
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const projectDescriptionBuilderLayout = useProjectDescriptionBuilderLayout(
    params.projectId
  );
  const route = `/admin/project-description-builder/projects/${params.projectId}/description`;
  const [
    projectDescriptionBuilderLinkVisible,
    setProjectDescriptionBuilderLinkVisible,
  ] = useState<boolean | null>(null);

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  useEffect(() => {
    if (!isNilOrError(projectDescriptionBuilderLayout)) {
      const projectDescriptionBuilderEnabled =
        projectDescriptionBuilderLayout.data.attributes.enabled;
      setProjectDescriptionBuilderLinkVisible(projectDescriptionBuilderEnabled);
    }
  }, [projectDescriptionBuilderLayout]);

  if (!featureEnabled) {
    return null;
  }

  const toggleProjectDescriptionBuilderLinkVisible = () => {
    toggleLayoutEnabledStatus(!projectDescriptionBuilderLinkVisible);
    setProjectDescriptionBuilderLinkVisible(
      !projectDescriptionBuilderLinkVisible
    );
  };

  const toggleLayoutEnabledStatus = async (enabled: boolean) => {
    try {
      await addProjectDescriptionBuilderLayout(params.projectId, { enabled });
    } catch {
      // Do nothing
    }
  };

  return (
    <Box data-testid="projectDescriptionBuilderToggle">
      {!isNil(projectDescriptionBuilderLayout) && (
        <Box display="flex" gap="12px">
          <StyledToggle
            id="e2e-toggle-enable-project-description-builder"
            checked={!!projectDescriptionBuilderLinkVisible}
            label={formatMessage(messages.toggleLabel)}
            onChange={toggleProjectDescriptionBuilderLinkVisible}
          />
          <StyledIconTooltip content={formatMessage(messages.toggleTooltip)} />
        </Box>
      )}
      {projectDescriptionBuilderLinkVisible && (
        <>
          <StyledLink id="e2e-project-description-builder-link" to={route}>
            {formatMessage(messages.linkText)}
          </StyledLink>
          <Box mt="10px">
            <Warning>{formatMessage(messages.layoutBuilderWarning)}</Warning>
          </Box>
        </>
      )}
      {!projectDescriptionBuilderLinkVisible && (
        <QuillMultilocWithLocaleSwitcher
          id="project-description"
          valueMultiloc={valueMultiloc}
          onChange={onChange}
          label={label}
          labelTooltipText={labelTooltipText}
          withCTAButton
        />
      )}
    </Box>
  );
};

export default injectIntl(withRouter(ProjectDescriptionBuilderToggle));

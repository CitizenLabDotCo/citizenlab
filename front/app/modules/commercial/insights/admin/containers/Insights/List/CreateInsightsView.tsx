import React, { useState } from 'react';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Input, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Checkbox from 'components/UI/Checkbox';

// resources
import { adopt } from 'react-adopt';
import GetProjects, {
  GetProjectsChildProps,
  PublicationStatus,
} from 'resources/GetProjects';

// hooks
import useLocalize from 'hooks/useLocalize';

// services
import { addInsightsView } from 'modules/commercial/insights/services/insightsViews';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { compact } from 'lodash-es';

// typings
import { CLErrors } from 'typings';

const Title = styled.h1`
  text-align: center;
  font-size: ${fontSizes.xxl}px;
`;

const Description = styled.p`
  text-align: center;
  padding-top: 10px;
  font-size: ${fontSizes.base}px;
`;

interface DataProps {
  projects: GetProjectsChildProps;
}

interface InputProps {
  closeCreateModal: () => void;
}

export const CreateInsightsView = ({
  projects,
  closeCreateModal,
}: DataProps & InputProps) => {
  const localize = useLocalize();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();

  const [name, setName] = useState<string | null>();
  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  const [selectedProjectsIds, setSelectedProjectsIds] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (name && selectedProjectsIds.length) {
      setLoading(true);
      try {
        const result = await addInsightsView({
          name,
          data_sources: selectedProjectsIds.map((projectId) => ({
            origin_id: projectId,
          })),
        });
        if (!isNilOrError(result)) {
          closeCreateModal();
          clHistory.push(`/admin/insights/${result.data.id}`);
        }
      } catch (errors) {
        setErrors(errors.json.errors);
        setLoading(false);
      }
    }
  };

  const toggleSelectProject = (projectId: string) => {
    if (selectedProjectsIds.includes(projectId)) {
      setSelectedProjectsIds(
        selectedProjectsIds.filter((id) => id !== projectId)
      );
    } else {
      setSelectedProjectsIds([...selectedProjectsIds, projectId]);
    }
  };
  const folderIds = compact(
    projects?.projectsList?.map((project) => project.attributes.folder_id)
  );
  console.log(folderIds);
  return (
    <Box
      w="100%"
      maxWidth="350px"
      m="40px auto"
      color={colors.adminTextColor}
      data-testid="insightsCreateModal"
    >
      <Title>
        <FormattedMessage {...messages.createModalTitle} />
      </Title>
      <Description>
        <FormattedMessage {...messages.createModalDescription} />
      </Description>
      <Box as="form" mt="50px">
        <SectionField>
          <Input
            type="text"
            id="view_name"
            value={name}
            onChange={onChangeName}
            label={<FormattedMessage {...messages.createModalNameLabel} />}
          />
          {errors && <Error apiErrors={errors['name']} fieldName="view_name" />}
        </SectionField>
        <Box>
          {projects.projectsList?.map((project) =>
            project.attributes.folder_id ? null : (
              <Box py="15px" borderBottom={`1px solid ${colors.separation}`}>
                <Checkbox
                  size="20px"
                  onChange={() => toggleSelectProject(project.id)}
                  label={localize(project.attributes.title_multiloc)}
                  checked={selectedProjectsIds.includes(project.id)}
                />
              </Box>
            )
          )}
        </Box>
        <Box display="flex" justifyContent="center" mt="60px">
          <Button
            processing={loading}
            disabled={!name || selectedProjectsIds.length === 0}
            onClick={handleSubmit}
            bgColor={colors.adminTextColor}
          >
            <FormattedMessage {...messages.createModalSaveView} />
          </Button>
          <Button onClick={closeCreateModal} buttonStyle="secondary" ml="5px">
            <FormattedMessage {...messages.createModalCancel} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const publicationStatuses: PublicationStatus[] = [
  'published',
  'archived',
  'draft',
];

const Data = adopt<DataProps>({
  projects: (
    <GetProjects
      publicationStatuses={publicationStatuses}
      filterCanModerate={true}
    />
  ),
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps: DataProps) => (
      <CreateInsightsView {...dataProps} {...inputProps} />
    )}
  </Data>
);

import React, { useCallback, useState } from 'react';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Button, Input, Select } from 'cl2-component-library';
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// resources
import { adopt } from 'react-adopt';
import GetProjects, {
  GetProjectsChildProps,
  PublicationStatus,
} from 'resources/GetProjects';

// hooks
import useLocalize from 'hooks/useLocalize';
import useLocale from 'hooks/useLocale';

// services
import { addInsightsView } from 'modules/commercial/insights/services/insightsViews';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { CLErrors } from 'typings';

const Container = styled.div`
  width: 100%;
  max-width: 350px;
  margin: 40px auto;
  color: ${colors.adminTextColor};
`;

const Title = styled.h1`
  text-align: center;
  font-size: ${fontSizes.xxl}px;
`;

const Description = styled.p`
  text-align: center;
  padding-top: 10px;
  font-size: ${fontSizes.base}px;
`;

const Form = styled.form`
  margin-top: 50px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  > :not(:first-child) {
    margin-left: 5px;
  }
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
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();

  const [name, setName] = useState<string | null>();
  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  const [projectScope, setProjectScope] = useState<string | null>();
  const onChangeProjectScope = (option) => {
    setProjectScope(option.value);
  };

  const getProjectOptions = useCallback(
    () =>
      projects?.projectsList
        ?.filter((project) => project.attributes.ideas_count > 0)
        .map((project) => ({
          label: localize(project.attributes.title_multiloc),
          value: project.id,
        })) ?? null,
    [projects]
  );

  async function handleSubmit() {
    if (name && projectScope) {
      setLoading(true);
      try {
        const result = await addInsightsView({ name, scope_id: projectScope });
        if (!isNilOrError(result)) {
          closeCreateModal();
        }
      } catch (errors) {
        setErrors(errors.json.errors);
        setLoading(false);
      }
    }
  }

  if (isNilOrError(locale)) return null;

  return (
    <Container data-testid="insightsCreateModal">
      <Title>
        <FormattedMessage {...messages.createModalTitle} />
      </Title>
      <Description>
        <FormattedMessage {...messages.createModalDescription} />
      </Description>
      <Form>
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
        <SectionField>
          <Select
            id="view_project_scope"
            options={getProjectOptions()}
            onChange={onChangeProjectScope}
            value={projectScope}
            label={
              <FormattedMessage {...messages.createModalProjectScopeLabel} />
            }
          />
        </SectionField>
        <ButtonContainer>
          <Button
            processing={loading}
            disabled={!(name && projectScope)}
            locale={locale}
            onClick={handleSubmit}
            bgColor={colors.adminTextColor}
          >
            <FormattedMessage {...messages.createModalSaveView} />
          </Button>
          <Button
            locale={locale}
            onClick={closeCreateModal}
            buttonStyle="secondary"
          >
            <FormattedMessage {...messages.createModalCancel} />
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
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

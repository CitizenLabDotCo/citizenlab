import React, { memo, useCallback, useState, useEffect } from 'react';
import { get, isEmpty, transform } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { transformLocale } from 'utils/helperUtils';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

// components
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Input from 'components/UI/Input';
import Modal from 'components/UI/Modal';
import Error from 'components/UI/Error';

// graphql
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

const Content = styled.div`
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 35px;
  padding-bottom: 50px;
`;

const StyledInputMultilocWithLocaleSwitcher = styled(InputMultilocWithLocaleSwitcher)`
  margin-bottom: 35px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const CreateProjectButton = styled(Button)`
  margin-right: 10px;
`;

export interface Props {
  projectTemplateId: string;
  opened: boolean;
  close: () => void;
}

interface IVariables {
  projectTemplateId: string | undefined;
  titleMultiloc: Multiloc;
  timelineStartAt: string;
}

const UseTemplateModal = memo<Props & WithRouterProps & InjectedIntlProps>(({ params, intl, projectTemplateId, opened, close }) => {

  const templateId: string | undefined = (projectTemplateId || get(params, 'projectTemplateId'));

  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const [titleError, setTitleError] = useState<Multiloc | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [responseError, setResponseError] = useState<any>(null);

  const APPLY_PROJECT_TEMPLATE = gql`
    mutation ApplyProjectTemplate(
      $projectTemplateId: ID!
      $titleMultiloc: MultilocAttributes!
      $timelineStartAt: String
    ) {
      applyProjectTemplate(
        projectTemplateId: $projectTemplateId
        titleMultiloc: $titleMultiloc
        timelineStartAt: $timelineStartAt
      ) {
        errors
      }
    }
  `;

  const [applyProjectTemplate] = useMutation<any, IVariables>(APPLY_PROJECT_TEMPLATE);

  const onCreateProject = useCallback(async () => {
    const invalidTitle = isEmpty(titleMultiloc) || (titleMultiloc && Object.getOwnPropertyNames(titleMultiloc).every(key => isEmpty(titleMultiloc[`${key}`])));
    const invalidDate = isEmpty(startDate);

    if (invalidTitle) {
      setTitleError({ [`${selectedLocale}`]: intl.formatMessage(messages.projectTitleError) });
    }

    if (invalidDate) {
      setStartDateError(intl.formatMessage(messages.projectStartDateError));
    }

    if (!invalidTitle && !invalidDate && titleMultiloc && startDate) {
      setResponseError(null);
      setTitleError(null);
      setStartDateError(null);
      setProcessing(true);

      const transformedTitleMultiloc = transform(titleMultiloc, (result: Multiloc, val, key) => {
        result[transformLocale(key)] = val;
      });

      try {
        await applyProjectTemplate({
          variables: {
            titleMultiloc: transformedTitleMultiloc,
            projectTemplateId: templateId,
            timelineStartAt: startDate
          }
        });
        await streams.fetchAllWith({
          apiEndpoint: [`${API_PATH}/projects`]
        });
        setProcessing(false);
        eventEmitter.emit('UseTemplateModal', 'NewProjectCreated', null);
        close();
      } catch (error) {
        setProcessing(false);
        setResponseError(error);
      }
    }
  }, [titleMultiloc, startDate, selectedLocale]);

  const onClose = useCallback(() => {
    close();
  }, []);

  const onTitleChange = useCallback((titleMultiloc: Multiloc | null) => {
    setResponseError(null);
    setTitleError(null);
    setTitleMultiloc(titleMultiloc);
  }, []);

  const onSelectedLocaleChange = useCallback((newSelectedLocale: Locale | null) => {
    setSelectedLocale(newSelectedLocale);
  }, []);

  const onStartDateChange = useCallback((startDate: string) => {
    setResponseError(null);
    setStartDateError(null);
    setStartDate(startDate);
  }, []);

  useEffect(() => {
    setTitleMultiloc(null);
    setStartDate(null);
    setSelectedLocale(null);
    setTitleError(null);
    setStartDateError(null);
    setProcessing(false);
    setResponseError(null);
  }, [opened]);

  return (
    <Modal
      width="500px"
      opened={opened}
      close={onClose}
      header={<FormattedMessage {...messages.useTemplateModalTitle} />}
      footer={
        <Footer>
          <CreateProjectButton
            style="secondary"
            onClick={onCreateProject}
            processing={processing}
          >
            <FormattedMessage {...messages.createProject} />
          </CreateProjectButton>
          {responseError !== null &&
            <Error
              text={<FormattedMessage {...messages.responseError} />}
              marginTop="0px"
              showBackground={false}
              showIcon={true}
            />
          }
        </Footer>
      }
    >
      <Content>
        <StyledInputMultilocWithLocaleSwitcher
          id="project-title"
          label={intl.formatMessage(messages.projectTitle)}
          placeholder={intl.formatMessage(messages.typeProjectName)}
          type="text"
          valueMultiloc={titleMultiloc}
          onValueChange={onTitleChange}
          onSelectedLocaleChange={onSelectedLocaleChange}
          errorMultiloc={titleError}
          autoFocus={true}
        />

        <Input
          id="project-start-date"
          label={intl.formatMessage(messages.projectStartDate)}
          type="date"
          onChange={onStartDateChange}
          value={startDate}
          error={startDateError}
        />
      </Content>
    </Modal>
  );
});

export default withRouter<Props>(injectIntl(UseTemplateModal));

import React, { memo, useCallback, useState } from 'react';
import { get, isEmpty } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Input from 'components/UI/Input';
import Modal from 'components/UI/Modal';

// graphql
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

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
  padding-top: 30px;
  padding-bottom: 50px;
`;

const StyledInputMultilocWithLocaleSwitcher = styled(InputMultilocWithLocaleSwitcher)`
  margin-bottom: 30px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
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

  const onCreateProject = useCallback(() => {
    const invalidTitle = isEmpty(titleMultiloc) || (titleMultiloc && Object.getOwnPropertyNames(titleMultiloc).every(key => isEmpty(titleMultiloc[`${key}`])));
    const invalidDate = isEmpty(startDate);

    if (invalidTitle) {
      setTitleError({ [`${selectedLocale}`]: intl.formatMessage(messages.projectTitleError) });
    }

    if (invalidDate) {
      setStartDateError(intl.formatMessage(messages.projectStartDateError));
    }

    if (!invalidTitle && !invalidDate && titleMultiloc && startDate) {
      setTitleError(null);
      setStartDateError(null);

      applyProjectTemplate({
        variables: {
          titleMultiloc,
          projectTemplateId: templateId,
          timelineStartAt: startDate
        }
      }).then((result) => {
        console.log('sucess!');
        console.log(result);
      }).catch((error) => {
        console.log('error');
        console.log(error);
      });
    }
  }, [titleMultiloc, startDate, selectedLocale]);

  const onClose = useCallback(() => {
    close();
  }, []);

  const onTitleChange = useCallback((titleMultiloc: Multiloc | null) => {
    setTitleError(null);
    setTitleMultiloc(titleMultiloc);
  }, []);

  const onSelectedLocaleChange = useCallback((newSelectedLocale: Locale | null) => {
    setSelectedLocale(newSelectedLocale);
  }, []);

  const onStartDateChange = useCallback((startDate: string) => {
    setStartDateError(null);
    setStartDate(startDate);
  }, []);

  return (
    <Modal
      width="500px"
      opened={opened}
      close={onClose}
      className="e2e-feedback-modal"
      header={<FormattedMessage {...messages.useTemplateModalTitle} />}
      footer={
        <Footer>
          <Button style="secondary" onClick={onCreateProject}>
            <FormattedMessage {...messages.createProject} />
          </Button>
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

export default withRouter(injectIntl(UseTemplateModal));

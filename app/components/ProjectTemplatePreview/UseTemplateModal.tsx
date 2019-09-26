import React, { memo, useCallback, useState, useEffect } from 'react';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import moment from 'moment';

// components
import Button from 'components/UI/Button';
import Input from 'components/UI/Input';
import InputMultiloc from 'components/UI/InputMultiloc';
import DateInput from 'components/UI/DateInput';
import Modal from 'components/UI/Modal';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

// graphql
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

// services
import { currentTenantStream, ITenantData } from 'services/tenant';

// hooks
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { Multiloc } from 'typings';

const Content = styled.div`
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 15px;
  padding-bottom: 15px;
`;

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  margin-bottom: 10px;
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

const UseTemplateModal = memo<Props & WithRouterProps>(({ params, projectTemplateId, opened, close }) => {

  const templateId: string | undefined = (projectTemplateId || get(params, 'projectTemplateId'));

  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [startDate, setStartDate] = useState<moment.Moment | null>(null);

  const locale = useLocale();
  const tenant = useTenant();

  console.log('locale:');
  console.log(locale);
  console.log('tenant:');
  console.log(tenant);

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
    applyProjectTemplate({
      variables: {
        projectTemplateId: templateId,
        titleMultiloc: {
          en: `Zolg_${Date.now}`
        },
        timelineStartAt: '2019-09-26'
      }
    }).then((result) => {
      console.log('sucess!');
      console.log(result);
    }).catch((error) => {
      console.log('error');
      console.log(error);
    });
  }, []);

  const onClose = useCallback(() => {
    close();
  }, []);

  const onTitleChange = useCallback((titleMultiloc: Multiloc | null) => {
    console.log(titleMultiloc);
  }, []);

  const onStartDateChange = useCallback((startDate: moment.Moment | null) => {
    console.log(startDate);
  }, []);

  /*
    type MultilocFormValues = {
        [field: string]: Multiloc;
    }
  */

  return (
    <Modal
      width="500px"
      opened={opened}
      close={onClose}
      className="e2e-feedback-modal"
      header={<FormattedMessage {...messages.createProject} />}
      footer={
        <Footer>
          <Button style="secondary" onClick={onCreateProject}>
            <FormattedMessage {...messages.createProject} />
          </Button>
        </Footer>
      }
    >
      <Content>
        {!isNilOrError(locale) &&
          <>
            <InputMultiloc
              type="text"
              valueMultiloc={titleMultiloc}
              onChange={onTitleChange}
              // onBlur={this.onBlur('title_multiloc')}
              // shownLocale={locale}
            />

            <DateInput
              value={startDate}
              onChange={onStartDateChange}
            />
          </>
        }
      </Content>
    </Modal>
  );
});

export default withRouter(UseTemplateModal);

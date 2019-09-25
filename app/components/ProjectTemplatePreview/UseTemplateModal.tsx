import React, { memo, useCallback } from 'react';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

// graphql
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { Multiloc } from 'typings';

const Footer = styled.div`
  width: 100%;
  display: flex;
`;

export interface Props {
  projectTemplateId: string;
  goBack?: () => void;
  useTemplate?: () => void;
  className?: string;
}

interface IVariables {
  projectTemplateId: string | undefined;
  titleMultiloc: Multiloc;
  timelineStartAt: string;
}

const ProjectTemplatePreviewPageAdmin = memo<Props & WithRouterProps>(({ params, projectTemplateId, goBack, useTemplate, className }) => {

  const templateId: string | undefined = (projectTemplateId || get(params, 'projectTemplateId'));

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

  const onGoBack = useCallback(() => {
    goBack ? goBack() : clHistory.push('/admin/projects');
  }, []);

  const onUseTemplate = useCallback(() => {
    applyProjectTemplate({
      variables: {
        projectTemplateId: templateId,
        titleMultiloc: {
          en: 'Zolg'
        },
        timelineStartAt: '2019-09-25'
      }
    }).then((result) => {
      console.log('sucess!');
      console.log(result);
      useTemplate && useTemplate();
    }).catch((error) => {
      console.log('error');
      console.log(error);
    });
  }, []);

  // if (templateId) {
  //   return (
  //     <Modal
  //       width="500px"
  //       opened={opened}
  //       close={this.closeFeedbackModalCancel}
  //       className="e2e-feedback-modal"
  //       header={<FormattedMessage {...messages.feedbackModalTitle} />}
  //       footer={
  //         <Footer>
  //           <Button style="secondary" onClick={useTemplate}>
  //             <FormattedMessage {...messages.createProject} />
  //           </Button>
  //         </Footer>
  //       }
  //     >
  //       <ShortFeedbackForm
  //         closeModal={this.closeFeedbackModalSuccess}
  //         submitting={this.handleFeedbackOnSubmit}
  //         successfullySubmitted={this.handleFeedbackSubmitted}
  //       />
  //     </Modal>
  //   );
  // }

  return null;
});

export default withRouter(ProjectTemplatePreviewPageAdmin);

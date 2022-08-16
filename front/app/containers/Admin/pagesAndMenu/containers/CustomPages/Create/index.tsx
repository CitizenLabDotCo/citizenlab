import React from 'react';
// import { useTheme } from 'styled-components';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
// import Error from 'components/UI/Error';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// typings

// constants
import { pagesAndMenuBreadcrumb } from '../../../breadcrumbs';

const CreateCustomPage = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  // const [bottomInfoSectionMultilocState, setBottomInfoSectionMultilocState] =
  //   useState<Multiloc | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  // const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);
  // const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');

  return (
    <SectionFormWrapper
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: 'Create custom page',
        },
      ]}
      title={formatMessage(messages.pageTitle)}
      stickyMenuContents={
        <SubmitWrapper
          status={'enabled'}
          buttonStyle="primary"
          loading={false}
          onClick={() => {}}
          messages={{
            buttonSave: messages.saveButton,
            buttonSuccess: messages.buttonSuccess,
            messageSuccess: messages.messageSuccess,
            messageError: messages.error,
          }}
        />
      }
    >
      <>create custom page</>
    </SectionFormWrapper>
  );
};

export default injectIntl(CreateCustomPage);

import React, { ReactElement } from 'react';

// components
import { Section } from 'components/admin/Section';

import SectionFormWrapper from '../../components/SectionFormWrapper';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';

// constants
import Warning from 'components/UI/Warning';

// names differ slightly between HomePage and CustomPage
interface Props {
  breadcrumbs: TBreadcrumbs;
  title?: string | JSX.Element;
  formStatus: ISubmitState;
  setFormStatus: (submitState: ISubmitState) => void;
  onSave: () => void;
  isLoading: boolean;
  outletSectionStart?: ReactElement;
  layoutSettingFieldComponent?: ReactElement;
  bannerImageFieldsComponent: ReactElement;
  bannerHeaderFieldsComponent: ReactElement;
  bannerMultilocFieldComponent?: ReactElement;
  avatarsFieldComponent?: ReactElement;
  outletSectionEnd?: ReactElement;
};

const GenericHeroBannerForm = ({
  onSave,
  formStatus,
  isLoading,
  title,
  breadcrumbs,
  outletSectionStart,
  avatarsFieldComponent,
  outletSectionEnd,
  bannerMultilocFieldComponent,
  bannerHeaderFieldsComponent,
  bannerImageFieldsComponent,
  layoutSettingFieldComponent,
}: Props) => {
  return (
    <SectionFormWrapper
      breadcrumbs={breadcrumbs}
      title={title}
      stickyMenuContents={
        <SubmitWrapper
          status={formStatus}
          buttonStyle="primary"
          loading={isLoading}
          onClick={onSave}
          messages={{
            buttonSave: messages.heroBannerSaveButton,
            buttonSuccess: messages.heroBannerButtonSuccess,
            messageSuccess: messages.heroBannerMessageSuccess,
            messageError: messages.heroBannerError,
          }}
        />
      }
    >
      <Section key={'header'}>
        <Warning>
          <FormattedMessage {...messages.heroBannerInfoBar} />
        </Warning>
        {outletSectionStart}
        {layoutSettingFieldComponent}
        {bannerImageFieldsComponent}
        {bannerHeaderFieldsComponent}
        {bannerMultilocFieldComponent}
        {avatarsFieldComponent}
        {outletSectionEnd}
      </Section>
    </SectionFormWrapper>
  );
};

export default GenericHeroBannerForm;

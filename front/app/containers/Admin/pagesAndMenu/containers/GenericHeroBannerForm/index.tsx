import React, { ReactElement } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { Section } from 'components/admin/Section';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import SectionFormWrapper from '../../components/SectionFormWrapper';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

import messages from './messages';
import SubmitWrapper, { ISubmitState } from './SubmitWrapper';

interface Props {
  breadcrumbs: TBreadcrumbs;
  title: string | JSX.Element;
  formStatus: ISubmitState;
  setFormStatus: (submitState: ISubmitState) => void;
  onSave: () => void;
  onSaveAndEnable?: () => void | undefined;
  isLoading: boolean;
  layoutSettingFieldComponent: ReactElement;
  bannerImageFieldsComponent: ReactElement;
  bannerHeaderFieldsComponent: ReactElement;
  ctaButtonFieldsComponent: ReactElement;
  badge: JSX.Element;
  viewPageLink: TypedLinkProps;
}

const GenericHeroBannerForm = ({
  onSave,
  onSaveAndEnable,
  formStatus,
  isLoading,
  title,
  breadcrumbs,
  bannerHeaderFieldsComponent,
  bannerImageFieldsComponent,
  layoutSettingFieldComponent,
  ctaButtonFieldsComponent,
  badge,
  viewPageLink,
}: Props) => {
  return (
    <>
      <SectionFormWrapper
        breadcrumbs={breadcrumbs}
        title={title}
        badge={badge}
        stickyMenuContents={
          <SubmitWrapper
            status={formStatus}
            buttonStyle="primary"
            loading={isLoading}
            onClick={onSave}
            enableFormOnSuccess
            messages={{
              buttonSave: messages.heroBannerSaveButton,
              buttonSuccess: messages.heroBannerButtonSuccess,
              messageSuccess: messages.heroBannerMessageSuccess,
              messageError: messages.heroBannerError,
            }}
            secondaryButtonOnClick={onSaveAndEnable}
            secondaryButtonSaveMessage={messages.saveAndEnable}
          />
        }
        rightSideCTA={<ViewCustomPageButton {...viewPageLink} />}
      >
        <Section key={'header'}>
          {/*
            Padding equal to the height of the sticky bar with the submit button.
          */}
          <Box pb="78px">
            <Box mb="28px">
              <Warning>
                <FormattedMessage {...messages.heroBannerInfoBar} />
              </Warning>
            </Box>
            {layoutSettingFieldComponent}
            {bannerImageFieldsComponent}
            {bannerHeaderFieldsComponent}
            {/* The custom page hero banner form has the CTA button fields inserted via the core */}
            {ctaButtonFieldsComponent}
          </Box>
        </Section>
      </SectionFormWrapper>
    </>
  );
};

export default GenericHeroBannerForm;

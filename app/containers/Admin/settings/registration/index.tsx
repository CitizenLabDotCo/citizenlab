import React, { useState } from 'react';
import styled from 'styled-components';
import getSubmitState from 'utils/getSubmitState';
import { IAppConfigurationSettings } from 'services/appConfiguration';

// components
import AllCustomFields from './CustomFields/All';
import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { IconTooltip } from 'cl2-component-library';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const LabelTooltip = styled.div`
  display: flex;
`;

interface Props {}

interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
}

const SettingsRegistrationTab = (_props: Props) => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [attributesDiff, setAttributesDiff] = useState<IAttributesDiff>({});
  const handleProjectHeaderOnChange = () => {};
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsFormSubmitting(true);
    // event.preventDefault();

    // const { tenant, attributesDiff } = this.state;

    // if (tenant && this.validate(tenant, attributesDiff)) {
    //   this.setState({ loading: true, saved: false });
    //   setIsFormSubmitting(true);
    //   setIsFormSaved(false);

    //   const homepageInfoPageMultiloc = attributesDiff.homepage_info;

    //   try {
    //     await updateAppConfiguration(
    //       attributesDiff as IUpdatedAppConfigurationProperties
    //     );

    //     if (!isNilOrError(homepageInfoPage)) {
    //       const homepageInfoPageId = homepageInfoPage.id;

    //       if (attributesDiff.homepage_info) {
    //         await updatePage(homepageInfoPageId, {
    //           body_multiloc: homepageInfoPageMultiloc,
    //         });
    //       }
    //     }
    //     setIsFormSubmitting(false);
    //     setIsFormSaved(true);
    //     setAttributesDiff({});
    //   } catch (error) {
    //     if (isCLErrorJSON(error)) {
    //       this.setState({ loading: false, errors: error.json.errors });
    //     } else {
    //       this.setState({ loading: false, errors: error });
    //     }
    //   }
    // }
  };
  return (
    <>
      <Section key={'signup_fields'}>
        <SectionTitle>
          <FormattedMessage {...messages.signupFormText} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.signupFormTooltip} />
        </SectionDescription>
        {/* <SubSectionTitle>
        <FormattedMessage {...messages.signupFormText} />
        <IconTooltip
          content={<FormattedMessage {...messages.signupFormTooltip} />}
        />
      </SubSectionTitle> */}
        <form onSubmit={handleSubmit}>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={{}}
              onChange={handleProjectHeaderOnChange}
              label={
                <LabelTooltip>
                  <FormattedMessage {...messages.firstPage} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.firstPageTooltip} />
                    }
                  />
                </LabelTooltip>
              }
            />
          </SectionField>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={{}}
              onChange={handleProjectHeaderOnChange}
              label={
                <LabelTooltip>
                  <FormattedMessage {...messages.secondPage} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.secondPageTooltip} />
                    }
                  />
                </LabelTooltip>
              }
            />
          </SectionField>
          {/* <SubmitWrapper
            loading={isFormSubmitting}
            status={getSubmitState({ errors, saved, diff: attributesDiff })}
            messages={{
              buttonSave: messages.save,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          /> */}
        </form>
      </Section>
      <Section>
        <SectionTitle>
          Fields
          {/* <FormattedMessage {...messages.signupFormText} /> */}
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleRegistration} />
        </SectionDescription>
        <AllCustomFields />
      </Section>
    </>
  );
};

export default SettingsRegistrationTab;

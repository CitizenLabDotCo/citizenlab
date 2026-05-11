import React from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { Section, SectionField } from 'components/admin/Section';
import ColorPicker from 'components/HookForm/ColorPicker';
import Feedback from 'components/HookForm/Feedback';
import Input from 'components/HookForm/Input';
import Toggle from 'components/HookForm/Toggle';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import { StyledCollapse, StyledSection } from './styles';

interface Props {
  openedCollapse: string | null;
  onToggleCollapse: (section: string) => void;
}

const SharedFormSections = ({ openedCollapse, onToggleCollapse }: Props) => {
  const { formatMessage } = useIntl();
  const methods = useFormContext();

  return (
    <>
      <StyledCollapse
        opened={openedCollapse === 'dimensions'}
        onToggle={() => onToggleCollapse('dimensions')}
        label={<FormattedMessage {...messages.titleDimensions} />}
      >
        <StyledSection>
          <SectionField>
            <Feedback />
          </SectionField>
          <SectionField>
            <Input
              name="width"
              type="number"
              label={formatMessage(messages.fieldWidth)}
            />
          </SectionField>
          <SectionField>
            <Input
              name="height"
              type="number"
              label={formatMessage(messages.fieldHeight)}
            />
          </SectionField>
          <SectionField>
            <Input
              name="fontSize"
              type="number"
              label={formatMessage(messages.fieldFontSize)}
            />
          </SectionField>
        </StyledSection>
      </StyledCollapse>

      <StyledCollapse
        opened={openedCollapse === 'style'}
        onToggle={() => onToggleCollapse('style')}
        label={<FormattedMessage {...messages.titleStyle} />}
      >
        <StyledSection>
          <SectionField>
            <Label htmlFor="siteBgColor">
              <FormattedMessage {...messages.fieldSiteBackgroundColor} />
            </Label>
            <ColorPicker name="siteBgColor" />
          </SectionField>
          <SectionField>
            <Label htmlFor="bgColor">
              <FormattedMessage {...messages.fieldBackgroundColor} />
            </Label>
            <ColorPicker name="bgColor" />
          </SectionField>
          <SectionField>
            <Label htmlFor="textColor">
              <FormattedMessage {...messages.fieldTextColor} />
            </Label>
            <ColorPicker name="textColor" />
          </SectionField>
          <SectionField>
            <Label htmlFor="accentColor">
              <FormattedMessage {...messages.fieldAccentColor} />
            </Label>
            <ColorPicker name="accentColor" />
          </SectionField>
          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldFont} />
            </Label>
            <Input name="font" type="text" />
            <p>
              <FormattedMessage
                {...messages.fieldFontDescription}
                values={{
                  googleFontsLink: (
                    <a
                      href="https://fonts.google.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Google Fonts
                    </a>
                  ),
                }}
              />
            </p>
          </SectionField>
        </StyledSection>
      </StyledCollapse>

      <StyledCollapse
        opened={openedCollapse === 'headerAndButton'}
        onToggle={() => onToggleCollapse('headerAndButton')}
        label={<FormattedMessage {...messages.titleHeaderAndButton} />}
      >
        <>
          <StyledSection>
            <SectionField>
              <Toggle
                name="showHeader"
                label={<FormattedMessage {...messages.fieldShowHeader} />}
              />
            </SectionField>
            {methods.getValues('showHeader') && (
              <Section>
                <SectionField>
                  <Toggle
                    name="showLogo"
                    label={<FormattedMessage {...messages.fieldShowLogo} />}
                  />
                </SectionField>
                <SectionField>
                  <Input
                    type="text"
                    name="headerText"
                    label={<FormattedMessage {...messages.fieldHeaderText} />}
                  />
                </SectionField>
                <SectionField>
                  <Input
                    type="text"
                    name="headerSubText"
                    label={
                      <FormattedMessage {...messages.fieldHeaderSubText} />
                    }
                  />
                </SectionField>
              </Section>
            )}
          </StyledSection>
          <StyledSection>
            <SectionField>
              <Toggle
                name="showFooter"
                label={<FormattedMessage {...messages.fieldShowFooter} />}
              />
            </SectionField>
            {methods.getValues('showFooter') && (
              <Section>
                <SectionField>
                  <Input
                    type="text"
                    label={<FormattedMessage {...messages.fieldButtonText} />}
                    name="buttonText"
                  />
                </SectionField>
              </Section>
            )}
          </StyledSection>
        </>
      </StyledCollapse>
    </>
  );
};

export default SharedFormSections;

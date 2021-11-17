import React, { useState } from 'react';
import styled from 'styled-components';
import { UploadFile } from 'typings';
import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import { Label, ColorPickerInput } from 'cl2-component-library';
import { ColorPickerSectionField } from 'containers/Admin/settings/customize';
import Warning from 'components/UI/Warning';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { isNilOrError } from 'utils/helperUtils';
import { calculateContrastRatio, hexToRgb } from 'utils/styleUtils';

const ContrastWarning = styled(Warning)`
  margin-top: 10px;
`;

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import useAppConfiguration from 'hooks/useAppConfiguration';

interface Props {
  logo: UploadFile[] | null;
  logoError: string | null;
}

type TenantColors = 'color_main' | 'color_secondary' | 'color_text';

const BrandingSection = ({ logo, logoError }: Props) => {
  const appConfiguration = useAppConfiguration();
  const [contrastColorMain, setContrastColorMain] = useState<number | null>(
    null
  );
  const [contrastColorSecondary, setContrastColorSecondary] = useState<
    number | null
  >(null);
  const [contrastColorText, setContrastColorText] = useState<number | null>(
    null
  );
  const [contrastWarningColorMain, setContrastWarningColorMain] = useState(
    false
  );
  const [
    contrastWarningColorSecondary,
    setContrastWarningColorSecondary,
  ] = useState(false);
  const [contrastWarningColorText, setContrastWarningColorText] = useState(
    false
  );

  const handleLogoOnAdd = () => {
    // TODO
  };
  const handleLogoOnRemove = () => {
    // TODO
  };

  const handleColorPickerOnChange = (colorName: TenantColors) => (
    hexColor: string
  ) => {
    let contrastRatio: number | null = null;
    const rgbColor = hexToRgb(hexColor);

    if (rgbColor) {
      const { r, g, b } = rgbColor;
      contrastRatio = calculateContrastRatio([255, 255, 255], [r, g, b]);
    }

    ({
      color_main: setContrastWarningColorMain,
      color_secondary: setContrastWarningColorSecondary,
      color_text: setContrastWarningColorText,
    }[colorName](contrastRatio && contrastRatio < 4.5 ? true : false));

    ({
      color_main: setContrastColorMain,
      color_secondary: setContrastColorSecondary,
      color_text: setContrastColorText,
    }[colorName](contrastRatio));

    // TODO: add state update in parent component
  };

  if (!isNilOrError(appConfiguration)) {
    // TODO
    const colorMain = '';
    const colorSecondary = '';
    const colorText = '';

    return (
      <Section key={'branding'}>
        <SectionTitle>
          <FormattedMessage {...messages.titleHomepageStyle} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleHomepageStyle} />
        </SectionDescription>

        <SubSectionTitle>
          <FormattedMessage {...messages.titlePlatformBranding} />
        </SubSectionTitle>

        {['color_main', 'color_secondary', 'color_text'].map(
          (colorName: TenantColors) => {
            const contrastRatioOfColor = {
              color_main: contrastColorMain,
              color_secondary: contrastColorSecondary,
              color_text: contrastColorText,
            }[colorName];
            const contrastRatioWarningOfColor = {
              color_main: contrastWarningColorMain,
              color_secondary: contrastWarningColorSecondary,
              color_text: contrastWarningColorText,
            }[colorName];

            return (
              <ColorPickerSectionField key={colorName}>
                <Label>
                  <FormattedMessage
                    {...{
                      color_main: messages.color_primary,
                      color_secondary: messages.color_secondary,
                      color_text: messages.color_text,
                    }[colorName]}
                  />
                </Label>
                <ColorPickerInput
                  type="text"
                  value={
                    {
                      color_main: colorMain,
                      color_secondary: colorSecondary,
                      color_text: colorText,
                    }[colorName]
                  }
                  onChange={handleColorPickerOnChange}
                />
                {contrastRatioWarningOfColor && contrastRatioOfColor && (
                  <ContrastWarning
                    text={
                      <FormattedMessage
                        {...messages.contrastRatioTooLow}
                        values={{
                          wcagLink: (
                            <a
                              href="https://www.w3.org/TR/WCAG21/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              WCAG 2.1 AA
                            </a>
                          ),
                          lineBreak: <br />,
                          contrastRatio: contrastRatioOfColor.toFixed(2),
                        }}
                      />
                    }
                  />
                )}
              </ColorPickerSectionField>
            );
          }
        )}

        <SectionField key={'logo'}>
          <Label htmlFor="tenant-logo-dropzone">
            <FormattedMessage {...messages.logo} />
          </Label>
          <ImagesDropzone
            id="tenant-logo-dropzone"
            acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
            images={logo}
            imagePreviewRatio={1}
            maxImagePreviewWidth="150px"
            objectFit="contain"
            onAdd={handleLogoOnAdd}
            onRemove={handleLogoOnRemove}
            errorMessage={logoError}
          />
        </SectionField>
      </Section>
    );
  }

  return null;
};

export default BrandingSection;

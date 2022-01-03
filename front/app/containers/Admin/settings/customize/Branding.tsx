import React, { useState } from 'react';
import styled from 'styled-components';

// components
import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import { Label, ColorPickerInput } from '@citizenlab/cl2-component-library';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { calculateContrastRatio, hexToRgb } from 'utils/styleUtils';
import { get } from 'lodash-es';
import {
  createAddUploadHandler,
  createRemoveUploadHandler,
} from './createHandler';

// typings
import { UploadFile } from 'typings';

const ContrastWarning = styled(Warning)`
  margin-top: 10px;
`;

interface Props {
  logo: UploadFile[] | null;
  logoError: string | null;
  setParentState: (state: any) => void;
  getSetting: (setting: string) => any;
}

interface ContrastRatios {
  color_main: number | null;
  color_secondary: number | null;
  color_text: number | null;
}

interface ContrastRatioWarnings {
  color_main: boolean;
  color_secondary: boolean;
  color_text: boolean;
}

type TenantColor = keyof ContrastRatios;

const TENANT_COLORS: TenantColor[] = [
  'color_main',
  'color_secondary',
  'color_text',
];

export default ({ logo, logoError, setParentState, getSetting }: Props) => {
  const [contrastRatios, setContrastRatios] = useState<ContrastRatios>({
    color_main: null,
    color_secondary: null,
    color_text: null,
  });

  const [contrastRatioWarnings, setContrastRatioWarnings] =
    useState<ContrastRatioWarnings>({
      color_main: false,
      color_secondary: false,
      color_text: false,
    });

  const handleColorPickerOnChange =
    (colorName: TenantColor) => (hexColor: string) => {
      let contrastRatio: number | null = null;
      const rgbColor = hexToRgb(hexColor);

      if (rgbColor) {
        const { r, g, b } = rgbColor;
        contrastRatio = calculateContrastRatio([255, 255, 255], [r, g, b]);
      }

      setContrastRatios((state) => ({
        ...state,
        [colorName]: contrastRatio,
      }));

      setContrastRatioWarnings((state) => ({
        ...state,
        [colorName]: contrastRatio && contrastRatio < 4.5 ? true : false,
      }));

      setParentState((state) => {
        return {
          attributesDiff: {
            ...state.attributesDiff,
            settings: {
              ...get(state.attributesDiff, 'settings', {}),
              core: {
                ...get(state.attributesDiff, 'settings.core', {}),
                [colorName]: hexColor,
              },
            },
          },
        };
      });
    };

  const handleLogoOnAdd = createAddUploadHandler('logo', setParentState);
  const handleLogoOnRemove = createRemoveUploadHandler('logo', setParentState);

  return (
    <Section key={'branding'}>
      <SectionTitle>
        <FormattedMessage {...messages.brandingTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.brandingDescription} />
      </SectionDescription>

      <SubSectionTitle>
        <FormattedMessage {...messages.colorsTitle} />
      </SubSectionTitle>

      {TENANT_COLORS.map((colorName) => {
        const contrastRatioOfColor = contrastRatios[colorName];
        const contrastRatioWarningOfColor = contrastRatioWarnings[colorName];

        return (
          <SectionField key={colorName}>
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
              value={getSetting(`core.${colorName}`)}
              onChange={handleColorPickerOnChange(colorName)}
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
          </SectionField>
        );
      })}

      <SectionField key={'logo'}>
        <SubSectionTitle>
          <FormattedMessage {...messages.logo} />
        </SubSectionTitle>
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
};

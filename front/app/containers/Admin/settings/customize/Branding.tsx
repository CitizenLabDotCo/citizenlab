import React, { useState } from 'react';

import {
  Label,
  ColorPickerInput,
  calculateContrastRatio,
  hexToRgb,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import styled from 'styled-components';
import { UploadFile } from 'typings';

import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const ContrastWarning = styled(Warning)`
  margin-top: 10px;
`;

interface Props {
  logo: UploadFile[] | null;
  setAttributesDiff: (state: any) => void;
  getSetting: (setting: string) => any;
  setLogo: (logo: UploadFile[] | null) => void;
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

export default ({ logo, setAttributesDiff, getSetting, setLogo }: Props) => {
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

      setAttributesDiff((attributesDiff) => {
        return {
          ...attributesDiff,
          settings: {
            ...get(attributesDiff, 'settings', {}),
            core: {
              ...get(attributesDiff, 'settings.core', {}),
              [colorName]: hexColor,
            },
          },
        };
      });
    };

  const handleLogoOnAdd = (newImage: UploadFile[]) => {
    setLogo([newImage[0]]);
    setAttributesDiff((attributesDiff) => {
      return {
        ...attributesDiff,
        logo: newImage[0].base64,
        settings: {
          ...get(attributesDiff, 'settings', {}),
          core: {
            ...get(attributesDiff, 'settings.core', {}),
          },
        },
      };
    });
  };

  const handleLogoOnRemove = () => {
    setLogo(null);
    setAttributesDiff((attributesDiff) => {
      return {
        ...attributesDiff,
        logo: null,
        settings: {
          ...get(attributesDiff, 'settings', {}),
          core: {
            ...get(attributesDiff, 'settings.core', {}),
          },
        },
      };
    });
  };

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
              <ContrastWarning>
                <FormattedMessage
                  {...messages.contrastRatioTooLow}
                  values={{
                    wcagLink: (
                      <a
                        href="https://www.w3.org/TR/WCAG22/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        WCAG 2.2 AA
                      </a>
                    ),
                    lineBreak: <br />,
                    contrastRatio: contrastRatioOfColor.toFixed(2),
                  }}
                />
              </ContrastWarning>
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
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          }}
          images={logo}
          imagePreviewRatio={1}
          maxImagePreviewWidth="150px"
          objectFit="contain"
          onAdd={handleLogoOnAdd}
          onRemove={handleLogoOnRemove}
        />
      </SectionField>
    </Section>
  );
};

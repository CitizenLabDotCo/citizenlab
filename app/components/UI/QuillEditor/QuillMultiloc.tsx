import React, { PureComponent } from 'react';

// components
import QuillEditor, { QuillEditorProps } from 'components/UI/QuillEditor';
import Label from 'components/UI/Label';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

// resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div``;

const EditorWrapper = styled.div`
  &:not(.last) {
    margin-bottom: 16px;
  }
`;

const LanguageExtension = styled.span`
  font-weight: 500;
  display: inline-block;
`;

export interface InputProps extends QuillEditorProps {
  id: string;
  valueMultiloc: Multiloc | null | undefined;
  label?: string | JSX.Element | null;
  labelTooltip?: JSX.Element;
  onChange?: (value: Multiloc) => void;
  onBlur?: () => void;
  className?: string;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {}

class QuillMultiloc extends PureComponent<Props, State> {

  handleOnChange = (value: string, locale: Locale | undefined) => {
    if (locale && this.props.onChange) {
      this.props.onChange({
        ...this.props.valueMultiloc,
        [locale]: value
      });
    }
  }

  handleOnBlur = () => {
    this.props.onBlur?.();
  }

  render() {
    const {
      tenantLocales,
      label,
      labelTooltip,
      id,
      valueMultiloc,
      noToolbar,
      noImages,
      noVideos,
      noAlign,
      limitedTextFormatting,
      className
    } = this.props;

    if (!isNilOrError(tenantLocales)) {
      return (
        <Container id={id} className={`${className || ''} e2e-multiloc-editor`} >
          {tenantLocales.map((locale, index) => {
            const idLocale = id && `${id}-${locale}`;
            const idLabelLocale = id && `label-${id}-${locale}`;

            return (
              <EditorWrapper
                key={locale}
                className={`${index === tenantLocales.length - 1 && 'last'}`}
              >
                {label &&
                  <Label id={idLabelLocale}>
                    {label}
                    {tenantLocales.length > 1 && <LanguageExtension>{locale.toUpperCase()}</LanguageExtension>}
                    {labelTooltip}
                  </Label>
                }

                <QuillEditor
                  id={idLocale}
                  value={valueMultiloc?.[locale] || ''}
                  locale={locale}
                  onChange={this.handleOnChange}
                  noToolbar={noToolbar}
                  noImages={noImages}
                  noVideos={noVideos}
                  noAlign={noAlign}
                  limitedTextFormatting={limitedTextFormatting}
                />
              </EditorWrapper>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

export default (InputProps: InputProps) => (
  <GetTenantLocales>
    {tenantLocales => <QuillMultiloc {...InputProps} tenantLocales={tenantLocales} />}
  </GetTenantLocales>
);

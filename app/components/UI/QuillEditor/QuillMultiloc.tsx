// Be careful when using this component, you have to use onChangeMultiloc and not onChange
// onChange will override the behaviour of this components and without any error from TS not work as intended

import React, { PureComponent } from 'react';
import { get } from 'lodash-es';

// components
import QuillEditor, { Props as VanillaProps } from 'components/UI/QuillEditor';
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
    margin-bottom: 20px;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const LanguageExtension = styled(Label)`
  font-weight: 500;
`;

const LabelTooltip = styled.div`
  margin-left: 10px;
  margin-top: 2px;
`;

export type InputProps = {
  id: string;
  valueMultiloc?: Multiloc | null;
  label?: string | JSX.Element | null;
  labelTooltip?: JSX.Element;
  onChangeMultiloc?: (value: Multiloc, locale: Locale) => void;
  renderPerLocale?: (locale: string) => JSX.Element;
  shownLocale?: Locale;
};

type DataProps = {
  tenantLocales: GetTenantLocalesChildProps;
};

interface Props extends InputProps, DataProps { }

export interface MultilocEditorProps extends InputProps, VanillaProps {}

interface State { }

class EditorMultiloc extends PureComponent<Props & VanillaProps, State> {
  handleOnChange = (locale: Locale) => (html: string) => {
    if (this.props.onChangeMultiloc) {
      this.props.onChangeMultiloc({
        ...this.props.valueMultiloc,
        [locale]: html
      }, locale);
    }
  }

  renderOnce = (currentTenantLocale, index) => {
    const { tenantLocales, id, label, labelTooltip, valueMultiloc, renderPerLocale, ...otherProps } = this.props;
    const value = get(valueMultiloc, [currentTenantLocale], undefined);
    const idLocale = id && `${id}-${currentTenantLocale}`;

    if (isNilOrError(tenantLocales)) return;

    return (
      <EditorWrapper key={currentTenantLocale} className={`${index === tenantLocales.length - 1 && 'last'}`}>
        {label &&
          <LabelWrapper>
            <Label>{label}</Label>
            {tenantLocales.length > 1 &&
              <LanguageExtension>{currentTenantLocale.toUpperCase()}</LanguageExtension>
            }
            {labelTooltip && <LabelTooltip>{labelTooltip}</LabelTooltip>}
          </LabelWrapper>
        }

        {renderPerLocale && renderPerLocale(currentTenantLocale)}

        <QuillEditor
          id={idLocale}
          value={value || ''}
          onChange={this.handleOnChange(currentTenantLocale)}
          {...otherProps}
        />
      </EditorWrapper>
    );
  }

  render() {
    const { tenantLocales, id, shownLocale } = this.props;

    if (!isNilOrError(tenantLocales)) {
      return (
        <Container id={id} className={`${this.props['className']} e2e-multiloc-editor`} >
          {shownLocale
            ? this.renderOnce(shownLocale, 0)
            : tenantLocales.map((currentTenantLocale, index) => (
              this.renderOnce(currentTenantLocale, index)
            ))
          }
        </Container>
      );
    }

    return null;
  }
}

export default (props: InputProps & VanillaProps) => (
  <GetTenantLocales>
    {tenantLocales => <EditorMultiloc {...props} tenantLocales={tenantLocales} />}
  </GetTenantLocales>
);

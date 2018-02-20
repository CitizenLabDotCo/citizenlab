import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { get } from 'lodash';

// components
import Editor from 'components/UI/Editor';
import Label from 'components/UI/Label';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';

// style
import styled from 'styled-components';

// typings
import { Locale, MultilocEditorState, MultilocStringOrJSX } from 'typings';
import { EditorState } from 'draft-js';

const Container = styled.div``;

const EditorWrapper = styled.div`
  &:not(.last) {
    margin-bottom: 12px;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
`;

const LanguageExtension = styled(Label)`
  font-weight: 500;
  margin-left: 5px;
`;

type Props = {
  id?: string | undefined;
  valueMultiloc?: MultilocEditorState | null | undefined;
  label?: string | JSX.Element | null | undefined;
  onChange?: (multilocEditorState: MultilocEditorState, locale: Locale) => void;
  placeholder?: string | JSX.Element | null | undefined;
  errorMultiloc?: MultilocStringOrJSX | null;
  toolbarConfig?: {} | null | undefined;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
};

export default class EditorMultiloc extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$
      ).subscribe(([locale, currentTenant]) => {
        this.setState({ locale, currentTenant });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnChange = (locale: Locale) => (editorState: EditorState) => {
    if (this.props.onChange) {
      this.props.onChange({
        ...this.props.valueMultiloc,
        [locale]: editorState
      }, locale);
    }
  }

  render() {
    const { locale, currentTenant } = this.state;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      return (
        <Container className={this.props['className']} >
          {currentTenantLocales.map((currentTenantLocale, index) => {
            const { label, valueMultiloc, placeholder, errorMultiloc } = this.props;
            const value = get(valueMultiloc, [currentTenantLocale], null);
            const error = get(errorMultiloc, [currentTenantLocale], null);
            const id = this.props.id && `${this.props.id}-${currentTenantLocale}`;

            return (
              <EditorWrapper key={currentTenantLocale} className={`${index === currentTenantLocales.length - 1 && 'last'}`}>
                {label &&
                  <LabelWrapper>
                    <Label>{label}</Label>
                    {currentTenantLocales.length > 1 &&
                      <LanguageExtension>{currentTenantLocale.toUpperCase()}</LanguageExtension>
                    }
                  </LabelWrapper>
                }

                <Editor
                  id={id}
                  value={value}
                  placeholder={placeholder}
                  error={error}
                  toolbarConfig={this.props.toolbarConfig}
                  onChange={this.handleOnChange(currentTenantLocale)}
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

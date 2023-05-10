import React, { Component } from 'react';
import { shallow } from 'enzyme';

jest.mock('@citizenlab/cl2-component-library', () => ({
  Input: 'Input',
  LocaleSwitcher: 'LocaleSwitcher',
}));
jest.mock('components/admin/ResourceList', () => ({
  TextCell: 'TextCell',
  Row: 'Row',
}));
jest.mock('components/UI/Button', () => 'Button');
jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));

import { QuestionFormRow, Props, State } from './QuestionFormRow';
import { Input, LocaleSwitcher } from '@citizenlab/cl2-component-library';

let onChange = jest.fn();
let onSave = jest.fn();
let onCancel = jest.fn();
const getTitleMultiloc = (title: string) => ({ en: title });

describe('<FormQuestionRow />', () => {
  beforeEach(() => {
    onChange = jest.fn();
    onSave = jest.fn();
    onCancel = jest.fn();
  });

  describe('handles language switch for multilingual content', () => {
    it('shows the passed in locale by default', () => {
      const wrapper = shallow<Component<Props, State>>(
        <QuestionFormRow
          titleMultiloc={getTitleMultiloc(
            'What is your favourite ice cream flavour ?'
          )}
          onChange={onChange}
          onSave={onSave}
          onCancel={onCancel}
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      expect(wrapper.find(Input).prop('locale')).toBe('en');
      expect(wrapper.find(LocaleSwitcher).prop('selectedLocale')).toBe('en');
    });

    it('handles changing field locale', () => {
      const wrapper = shallow<Component<Props, State>>(
        <QuestionFormRow
          titleMultiloc={getTitleMultiloc(
            'What is your favourite ice cream flavour ?'
          )}
          onChange={onChange}
          onSave={onSave}
          onCancel={onCancel}
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      wrapper.find(LocaleSwitcher).prop('onSelectedLocaleChange')('fr-BE');
      expect(wrapper.find(Input).prop('locale')).toBe('fr-BE');
    });
  });

  describe('handles controlled input of title multiloc', () => {
    it('passes down initial value', () => {
      const wrapper = shallow<Component<Props, State>>(
        <QuestionFormRow
          titleMultiloc={getTitleMultiloc(
            'What is your favourite ice cream flavour ?'
          )}
          onChange={onChange}
          onSave={onSave}
          onCancel={onCancel}
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      expect(wrapper.find(Input).prop('value')).toEqual(
        'What is your favourite ice cream flavour ?'
      );
    });

    it('reacts to user input', () => {
      const wrapper = shallow<Component<Props, State>>(
        <QuestionFormRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream ')}
          onChange={onChange}
          onSave={onSave}
          onCancel={onCancel}
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      wrapper.find(Input).prop('onChange' as any)(
        'What is your favourite ice cream flavour ?',
        'en'
      );
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        en: 'What is your favourite ice cream flavour ?',
      });
    });

    it('reacts to content changes', () => {
      const wrapper = shallow<Component<Props, State>>(
        <QuestionFormRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream ')}
          onChange={onChange}
          onSave={onSave}
          onCancel={onCancel}
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      wrapper.setProps({
        titleMultiloc: getTitleMultiloc(
          'What is your favourite ice cream flavour ?'
        ),
      });
      expect(wrapper.find(Input).prop('value')).toEqual(
        'What is your favourite ice cream flavour ?'
      );
    });
  });

  describe('handles saving', () => {
    it('calls onSave when clicking save button', () => {
      const wrapper = shallow<Component<Props, State>>(
        <QuestionFormRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream ')}
          onChange={onChange}
          onSave={onSave}
          onCancel={onCancel}
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );

      wrapper.find('.e2e-form-question-save').simulate('click');
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('handles cancelling', () => {
    it('calls onCancel when clicking cancel button', () => {
      const wrapper = shallow<Component<Props, State>>(
        <QuestionFormRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream ')}
          onChange={onChange}
          onSave={onSave}
          onCancel={onCancel}
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      wrapper.find('.e2e-form-question-cancel').simulate('click');
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});

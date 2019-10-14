import React from 'react';

import { shallow } from 'enzyme';

jest.mock('components/admin/FormLocaleSwitcher', () => 'FormLocaleSwitcher');
jest.mock('components/admin/ResourceList', () => ({ TextCell: 'TextCell', Row: 'Row' }));
jest.mock('components/UI/InputMultiloc', () => 'InputMultiloc');
jest.mock('components/UI/Button', () => 'Button');
jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));

import FormQuestionRow from './FormQuestionRow';

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
      const wrapper = shallow(
        <FormQuestionRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream flavour ?')}
          onChange={onChange}
          locale="en"
          onSave={onSave}
          onCancel={onCancel}
        />
      );

      expect(wrapper.find('InputMultiloc').prop('selectedLocale')).toBe('en');
      expect(wrapper.find('FormLocaleSwitcher').prop('selectedLocale')).toBe('en');
    });
    it('reacts to locale change', () => {
      const wrapper = shallow(
        <FormQuestionRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream flavour ?')}
          onChange={onChange}
          locale="en"
          onSave={onSave}
          onCancel={onCancel}
        />);
        wrapper.setProps({ locale: 'fr-BE' });
        expect(wrapper.find('InputMultiloc').prop('selectedLocale')).toBe('fr-BE');
    });
    it('handles changing field locale', () => {
      const wrapper = shallow(
        <FormQuestionRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream flavour ?')}
          onChange={onChange}
          locale="en"
          onSave={onSave}
          onCancel={onCancel}
        />
      );
      wrapper.find('FormLocaleSwitcher').prop('onLocaleChange')('fr-BE');
      expect(wrapper.find('InputMultiloc').prop('selectedLocale')).toBe('fr-BE');

    });
  });
  describe('handles controlled input of title multiloc', () => {
    it('passes down initial value', () => {
      const wrapper = shallow(
        <FormQuestionRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream flavour ?')}
          onChange={onChange}
          locale="en"
          onSave={onSave}
          onCancel={onCancel}
        />
      );

      expect(wrapper.find('InputMultiloc').prop('valueMultiloc')).toEqual(getTitleMultiloc('What is your favourite ice cream flavour ?'));
    });
    it('reacts to user input', () => {
      const wrapper = shallow(
        <FormQuestionRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream ')}
          onChange={onChange}
          locale="en"
          onSave={onSave}
          onCancel={onCancel}
        />
      );
      wrapper.find('InputMultiloc').prop('onChange')(getTitleMultiloc('What is your favourite ice cream flavour ?'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(getTitleMultiloc('What is your favourite ice cream flavour ?'));
    });
    it('reacts to content changes', () => {
      const wrapper = shallow(
        <FormQuestionRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream ')}
          onChange={onChange}
          locale="en"
          onSave={onSave}
          onCancel={onCancel}
        />
      );
      wrapper.setProps({ titleMultiloc: getTitleMultiloc('What is your favourite ice cream flavour ?') });

      expect(wrapper.find('InputMultiloc').prop('valueMultiloc')).toEqual(getTitleMultiloc('What is your favourite ice cream flavour ?'));
    });
  });
  describe('handles saving', () => {
    it('calls onSave when clicking save button', () => {
      const wrapper = shallow(
        <FormQuestionRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream ')}
          onChange={onChange}
          locale="en"
          onSave={onSave}
          onCancel={onCancel}
        />
      );

      wrapper.find('.e2e-form-question-save').simulate('click');
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });
  describe('handles cancelling', () => {
    it('calls onCancel when clicking cancel button', () => {
      const wrapper = shallow(
        <FormQuestionRow
          titleMultiloc={getTitleMultiloc('What is your favourite ice cream ')}
          onChange={onChange}
          locale="en"
          onSave={onSave}
          onCancel={onCancel}
        />
      );

      wrapper.find('.e2e-form-question-cancel').simulate('click');
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});

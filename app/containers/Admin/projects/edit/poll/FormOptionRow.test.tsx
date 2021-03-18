import React, { Component } from 'react';
import { shallow } from 'enzyme';
import { mockOption } from 'services/__mocks__/pollOptions';

jest.mock('services/pollOptions', () => ({
  addPollOption: jest.fn((_id, _type, title) => {
    return new Promise((resolve) =>
      resolve({ data: mockOption('newOption', title) })
    );
  }),
  updatePollOption: jest.fn(() => {
    return new Promise((resolve) => resolve);
  }),
}));

import * as pollOptionsService from 'services/pollOptions';
const addPollOptionSpy = jest.spyOn(pollOptionsService, 'addPollOption');
const updatePollOptionSpy = jest.spyOn(pollOptionsService, 'updatePollOption');

import { Input, LocaleSwitcher } from 'cl2-component-library';

jest.mock('cl2-component-library', () => ({
  Input: 'Input',
  LocaleSwitcher: 'LocaleSwitcher',
}));
jest.mock('components/admin/ResourceList', () => ({
  TextCell: 'TextCell',
  Row: 'Row',
}));
jest.mock(
  'components/UI/InputMultilocWithLocaleSwitcher',
  () => 'InputMultilocWithLocaleSwitcher'
);
jest.mock('components/UI/Button', () => 'Button');
jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));

import { FormOptionRow, Props, State } from './FormOptionRow';

let closeRow = jest.fn();
const getTitleMultiloc = (title: string) => ({ en: title });

describe('<FormOptionRow />', () => {
  beforeEach(() => {
    closeRow = jest.fn();
  });

  it('matches the snapshot', () => {
    const titleMultiloc = getTitleMultiloc('Vanilla');
    const wrapper = shallow<Component<Props, State>>(
      <FormOptionRow
        titleMultiloc={titleMultiloc}
        closeRow={closeRow}
        mode="edit"
        questionId="questionId"
        optionId="optionId"
        locale="en"
        tenantLocales={['en', 'fr-BE']}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  describe('boundaries', () => {
    it('reacts to option change', () => {
      const titleMultiloc = getTitleMultiloc('Vanilla');
      const wrapper = shallow<Component<Props, State>>(
        <FormOptionRow
          titleMultiloc={titleMultiloc}
          closeRow={closeRow}
          mode="edit"
          questionId="questionId"
          optionId="optionId"
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      wrapper.setProps({
        titleMultiloc: getTitleMultiloc('Pistachio'),
        optionId: 'anotherOption',
      });
      expect(wrapper.find('Input').prop('value')).toEqual('Pistachio');
    });
  });

  describe('handles language switch for multilingual content', () => {
    it('shows the passed in locale by default', () => {
      const wrapper = shallow<Component<Props, State>>(
        <FormOptionRow
          closeRow={closeRow}
          mode="new"
          questionId="questionId"
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      expect(wrapper.find('Input').prop('locale')).toBe('en');
      expect(wrapper.find('LocaleSwitcher').prop('selectedLocale')).toBe('en');
    });

    it('handles changing field locale', () => {
      const wrapper = shallow<Component<Props, State>>(
        <FormOptionRow
          titleMultiloc={getTitleMultiloc('Vanilla')}
          closeRow={closeRow}
          mode="new"
          questionId="questionId"
          locale="en"
          tenantLocales={['en', 'fr-BE']}
        />
      );
      wrapper.find(LocaleSwitcher).prop('onSelectedLocaleChange')('fr-BE');
      expect(wrapper.find('Input').prop('locale')).toBe('fr-BE');
    });
  });

  describe('handles input of title multiloc', () => {
    describe('for a new option', () => {
      it('passes down initial value', () => {
        const wrapper = shallow<Component<Props, State>>(
          <FormOptionRow
            closeRow={closeRow}
            mode="new"
            questionId="questionId"
            locale="en"
            tenantLocales={['en', 'fr-BE']}
          />
        );
        expect(wrapper.find('Input').prop('value')).toEqual(undefined);
      });

      it('reacts to user input', () => {
        const titleMultiloc = getTitleMultiloc('Vanilla');
        const wrapper = shallow<Component<Props, State>>(
          <FormOptionRow
            titleMultiloc={titleMultiloc}
            closeRow={closeRow}
            mode="new"
            questionId="questionId"
            locale="en"
            tenantLocales={['en', 'fr-BE']}
          />
        );
        wrapper.find(Input).prop('onChange' as any)('Pistachio', 'en');
        wrapper.find(Input).prop('onChange' as any)('Chocolate', 'fr-BE');
        const instance = wrapper.instance();
        expect(instance.state.titleMultiloc['en']).toBe('Pistachio');
        expect(instance.state.titleMultiloc['fr-BE']).toBe('Chocolate');
      });
    });

    describe('when editing an option', () => {
      it('passes down initial value', () => {
        const titleMultiloc = getTitleMultiloc('Vanilla');
        const wrapper = shallow<Component<Props, State>>(
          <FormOptionRow
            titleMultiloc={titleMultiloc}
            closeRow={closeRow}
            mode="edit"
            questionId="questionId"
            optionId="optionId"
            locale="en"
            tenantLocales={['en', 'fr-BE']}
          />
        );
        expect(wrapper.find('Input').prop('value')).toEqual(
          titleMultiloc['en']
        );
      });

      it('reacts to user input', () => {
        const wrapper = shallow<Component<Props, State>>(
          <FormOptionRow
            titleMultiloc={getTitleMultiloc('Vani')}
            closeRow={closeRow}
            mode="edit"
            questionId="questionId"
            optionId="optionId"
            locale="en"
            tenantLocales={['en', 'fr-BE']}
          />
        );
        wrapper.find(Input).prop('onChange' as any)('Vanilla', 'en');
        expect(wrapper.find('Input').prop('value')).toEqual('Vanilla');
      });
    });
  });

  describe('handles saving', () => {
    describe('for a new option', () => {
      it('handles saving the new option', () => {
        const titleMultiloc = getTitleMultiloc('Vani');
        const questionId = 'questionId';
        const wrapper = shallow<Component<Props, State>>(
          <FormOptionRow
            titleMultiloc={getTitleMultiloc('Vani')}
            closeRow={closeRow}
            mode="new"
            questionId={questionId}
            locale="en"
            tenantLocales={['en', 'fr-BE']}
          />
        );
        wrapper.find('.e2e-form-option-save').simulate('click');
        expect(addPollOptionSpy).toHaveBeenCalledTimes(1);
        expect(addPollOptionSpy).toHaveBeenCalledWith(
          questionId,
          titleMultiloc
        );
        // resolve the promise the test the callback
        return pollOptionsService
          .addPollOption(questionId, titleMultiloc)
          .then(() => {
            expect(closeRow).toHaveBeenCalledTimes(1);
          });
      });
    });

    describe('when editing an option', () => {
      it('handles updating the option', () => {
        const wrapper = shallow<Component<Props, State>>(
          <FormOptionRow
            closeRow={closeRow}
            mode="edit"
            questionId="questionId"
            optionId="optionId"
            locale="en"
            tenantLocales={['en', 'fr-BE']}
          />
        );
        wrapper.setState({ titleMultiloc: getTitleMultiloc('Vanilla') });
        wrapper.find('.e2e-form-option-save').simulate('click');
        expect(updatePollOptionSpy).toHaveBeenCalledTimes(1);
        expect(updatePollOptionSpy).toHaveBeenCalledWith('optionId', {
          en: 'Vanilla',
        });
      });
    });
  });

  describe('handles cancelling', () => {
    describe('for a new option', () => {
      it('handles closing the form to cancel', () => {
        const wrapper = shallow<Component<Props, State>>(
          <FormOptionRow
            closeRow={closeRow}
            mode="new"
            questionId="questionId"
            locale="en"
            tenantLocales={['en', 'fr-BE']}
          />
        );
        wrapper.find('.e2e-form-option-cancel').simulate('click');
        expect(closeRow).toHaveBeenCalledTimes(1);
      });
    });

    describe('when editing an option', () => {
      it('handles closing the form to cancel', () => {
        const wrapper = shallow<Component<Props, State>>(
          <FormOptionRow
            titleMultiloc={getTitleMultiloc('Vani')}
            closeRow={closeRow}
            mode="new"
            questionId="questionId"
            optionId="optionId"
            locale="en"
            tenantLocales={['en', 'fr-BE']}
          />
        );
        wrapper.find('.e2e-form-option-cancel').simulate('click');
        expect(closeRow).toHaveBeenCalledTimes(1);
      });
    });
  });
});

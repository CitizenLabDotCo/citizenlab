import React from 'react';

import { LogicType } from 'api/custom_fields/types';

import { saveSurveyAsPDF } from 'containers/Admin/projects/project/surveyFormAssets/saveSurveyAsPDF';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import PDFExportModal from './index';

jest.mock('api/phases/usePhase', () => () => ({
  data: {
    data: {
      id: 'phase-1',
      attributes: { participation_method: 'native_survey' },
    },
  },
}));

// Stable references, because the modal resets its form whenever they change.
const mockCustomForm = {
  data: {
    data: {
      attributes: {
        print_start_multiloc: {},
        print_end_multiloc: {},
        print_personal_data_fields: false,
      },
    },
  },
};
jest.mock('api/custom_form/useCustomForm', () => () => mockCustomForm);

jest.mock('api/custom_form/useUpdateCustomForm', () => () => ({
  mutateAsync: () => Promise.resolve(),
}));

jest.mock(
  'containers/Admin/projects/project/surveyFormAssets/saveSurveyAsPDF',
  () => ({ saveSurveyAsPDF: jest.fn(() => Promise.resolve()) })
);

let mockCustomFields: { data: { id: string; logic: LogicType }[] } = {
  data: [],
};
jest.mock('api/custom_fields/useCustomFields', () => () => mockCustomFields);

const setFieldLogic = (logic: LogicType[]) => {
  mockCustomFields = {
    data: logic.map((fieldLogic, index) => ({
      id: `field-${index}`,
      logic: fieldLogic,
    })),
  };
};

const renderModal = () =>
  render(
    <PDFExportModal
      phaseId="phase-1"
      open
      formType="survey"
      onClose={() => undefined}
    />
  );

describe('PDFExportModal form logic option', () => {
  beforeEach(() => {
    jest.mocked(saveSurveyAsPDF).mockClear();
  });

  it.each([
    ['a question has rules', [{}, { rules: [{ if: 1, goto_page_id: 'p' }] }]],
    ['a page has a default next page', [{ next_page_id: 'p' }, {}]],
  ])(
    'offers the logic option, checked, and exports with logic when %s',
    async (_, logic: LogicType[]) => {
      setFieldLogic(logic);
      renderModal();

      const checkbox = await screen.findByRole('checkbox', {
        name: /Include form logic/,
      });
      await waitFor(() => expect(checkbox).toBeChecked());

      await userEvent.click(
        screen.getByRole('button', { name: /Download PDF form/ })
      );

      await waitFor(() =>
        expect(saveSurveyAsPDF).toHaveBeenCalledWith(
          expect.objectContaining({ include_logic: true })
        )
      );
    }
  );

  it('does not offer the logic option when every rules list is empty', async () => {
    setFieldLogic([{}, { rules: [] }]);
    renderModal();

    await userEvent.click(
      await screen.findByRole('button', { name: /Download PDF form/ })
    );

    expect(
      screen.queryByRole('checkbox', { name: /Include form logic/ })
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(saveSurveyAsPDF).toHaveBeenCalledWith(
        expect.objectContaining({ include_logic: false })
      )
    );
  });
});

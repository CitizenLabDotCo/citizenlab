# frozen_string_literal: true

require 'rails_helper'

describe FormLogicService do
  subject(:form_logic) { described_class.new fields }

  let(:form) { create(:custom_form) }
  let(:fields) do
    # Guarantee correct values for `ordering` attribute.
    [
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_linear_scale, :for_custom_form, maximum: 3),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_select, :for_custom_form, :with_options, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form)
    ]
  end

  describe '#valid?' do
    let(:page1) { fields[0] }
    let(:question1) { fields[1] }
    let(:page2) { fields[2] }
    let(:question2) { fields[3] }
    let(:page3) { fields[4] }
    let(:page4) { fields[5] }
    let(:page5) { fields[6] }
    let(:section1) { fields[7] }
    let(:last_page) { fields[8] }

    context 'for logic on questions' do
      context 'when logic has a good structure' do
        it 'returns true' do
          [
            {},
            { 'rules' => [] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => last_page.id }] },
            { 'rules' => [
              { 'if' => 1, 'goto_page_id' => page2.id },
              { 'if' => 2, 'goto_page_id' => page4.id },
              { 'if' => 'no_answer', 'goto_page_id' => page2.id },
              { 'if' => 'any_other_answer', 'goto_page_id' => page2.id }
            ] }
          ].each do |good_logic|
            question1.update! logic: good_logic, required: true

            expect(form_logic.valid?).to be true
            expect(question1.errors).to be_empty
            expect(question2.errors).to be_empty
          end
        end
      end

      context 'when all logic in multiple fields have good structure' do
        let(:logic_for_question1) do
          { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] }
        end
        let(:logic_for_question2) do
          { 'rules' => [
            { 'if' => 1, 'goto_page_id' => last_page.id },
            { 'if' => 2, 'goto_page_id' => page4.id },
            { 'if' => 'no_answer', 'goto_page_id' => last_page.id },
            { 'if' => 'any_other_answer', 'goto_page_id' => page4.id }
          ] }
        end

        it 'returns true' do
          question1.update! logic: logic_for_question1, required: true
          question2.update! logic: logic_for_question2, required: true

          expect(form_logic.valid?).to be true
          expect(question1.errors).to be_empty
          expect(question2.errors).to be_empty
        end
      end

      context 'when logic has a bad structure' do
        it 'returns false' do
          [
            { 'bad' => [] },
            { 'rules' => [], 'bad' => [] },
            { 'rules' => [{}] },
            { 'rules' => [{ 'test' => {} }] },
            { 'rules' => [{ 'if' => 1 }] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id, 'bad' => {} }] }
          ].each do |bad_logic|
            question1.update! logic: bad_logic, required: true
            expect(form_logic.valid?).to be false
            expect(question1.errors.messages.to_h).to eq({
              logic: ['has invalid structure']
            })
            expect(question1.errors.details).to eq({
              logic: [{ error: :invalid_structure }]
            })
          end
        end
      end

      context 'when some logic in multiple fields has bad structure' do
        let(:logic_for_question1) do
          { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] }
        end
        let(:logic_for_question2) do
          { 'rules' => [
            { 'if' => 1, 'goto_page_id' => last_page.id },
            { 'if' => 2 }
          ] }
        end

        it 'returns true' do
          question1.update! logic: logic_for_question1, required: true
          question2.update! logic: logic_for_question2, required: true

          expect(form_logic.valid?).to be false
          expect(question1.errors).to be_empty
          expect(question2.errors.messages.to_h).to eq({
            logic: ['has invalid structure']
          })
          expect(question2.errors.details).to eq({
            logic: [{ error: :invalid_structure }]
          })
        end
      end

      context 'when logic has invalid goto_page_id' do
        it 'returns false' do
          invalid_goto_page_id = create(:custom_field_page).id
          [
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => invalid_goto_page_id }] },
            { 'rules' => [
              { 'if' => 1, 'goto_page_id' => invalid_goto_page_id },
              { 'if' => 2, 'goto_page_id' => page4.id }
            ] }
          ].each do |bad_logic|
            question1.update! logic: bad_logic, required: true

            expect(form_logic.valid?).to be false
            expect(question1.errors.messages.to_h).to eq({
              logic: ['has invalid goto_page_id']
            })
            expect(question1.errors.details).to eq({
              logic: [{ error: :invalid_goto_page_id, value: invalid_goto_page_id }]
            })
          end
        end
      end

      context 'when logic has target pages that occur before the source field' do
        it 'returns false' do
          invalid_goto_page_id = page1.id
          [
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => invalid_goto_page_id }] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => invalid_goto_page_id }] }
          ].each do |bad_logic|
            question1.update! logic: bad_logic, required: true

            expect(form_logic.valid?).to be false
            expect(question1.errors.messages.to_h).to eq({
              logic: ['has target before source']
            })
            expect(question1.errors.details).to eq({
              logic: [{ error: :target_before_source_not_allowed, value: invalid_goto_page_id }]
            })
          end
        end
      end

      context 'when logic has target fields that are not pages' do
        it 'returns false' do
          invalid_goto_page_id = question2.id
          [
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => invalid_goto_page_id }] },
            { 'rules' => [
              { 'if' => 1, 'goto_page_id' => page2.id },
              { 'if' => 2, 'goto_page_id' => invalid_goto_page_id }
            ] }
          ].each do |bad_logic|
            question1.update! logic: bad_logic, required: true

            expect(form_logic.valid?).to be false
            expect(question1.errors.messages.to_h).to eq({
              logic: ['has target that is not a page']
            })
            expect(question1.errors.details).to eq({
              logic: [{ error: :only_page_allowed_as_target, value: invalid_goto_page_id }]
            })
          end
        end
      end
    end

    context 'for logic on pages' do
      context 'when logic has a good structure' do
        it 'returns true' do
          [
            {},
            { 'next_page_id' => page3.id },
            { 'next_page_id' => page4.id },
            { 'next_page_id' => page5.id }
          ].each do |good_logic|
            page2.update! logic: good_logic, required: true

            expect(form_logic.valid?).to be true
            expect(page1.errors).to be_empty
            expect(question1.errors).to be_empty
            expect(page2.errors).to be_empty
            expect(question2.errors).to be_empty
            expect(page3.errors).to be_empty
            expect(page4.errors).to be_empty
            expect(page5.errors).to be_empty
          end
        end
      end

      context 'when all logic in multiple pages have good structure' do
        let(:logic_for_page1) { { 'next_page_id' => page4.id } }
        let(:logic_for_page2) { { 'next_page_id' => page5.id } }

        it 'returns true' do
          page1.update! logic: logic_for_page1, required: true
          page2.update! logic: logic_for_page2, required: true

          expect(form_logic.valid?).to be true
          expect(page1.errors).to be_empty
          expect(question1.errors).to be_empty
          expect(page2.errors).to be_empty
          expect(question2.errors).to be_empty
          expect(page3.errors).to be_empty
          expect(page4.errors).to be_empty
          expect(page5.errors).to be_empty
        end
      end

      context 'when logic has a bad structure' do
        it 'returns false' do
          bad_logic = { 'bad' => page5.id }
          page2.update! logic: bad_logic, required: true
          expect(form_logic.valid?).to be false
          expect(page1.errors).to be_empty
          expect(question1.errors).to be_empty
          expect(page2.errors.messages.to_h).to eq({
            logic: ['has invalid structure']
          })
          expect(page2.errors.details).to eq({
            logic: [{ error: :invalid_structure }]
          })
          expect(question2.errors).to be_empty
          expect(page3.errors).to be_empty
          expect(page4.errors).to be_empty
          expect(page5.errors).to be_empty
        end
      end

      context 'when logic has invalid next_page_id' do
        it 'returns false' do
          invalid_next_page_id = create(:custom_field_page).id
          bad_logic = { 'next_page_id' => invalid_next_page_id }
          page2.update! logic: bad_logic, required: true

          expect(form_logic.valid?).to be false
          expect(page1.errors).to be_empty
          expect(question1.errors).to be_empty
          expect(page2.errors.messages.to_h).to eq({
            logic: ['has invalid next_page_id']
          })
          expect(page2.errors.details).to eq({
            logic: [{ error: :invalid_next_page_id, value: invalid_next_page_id }]
          })
          expect(question2.errors).to be_empty
          expect(page3.errors).to be_empty
          expect(page4.errors).to be_empty
          expect(page5.errors).to be_empty
        end
      end

      context 'when logic has a target page that does not follow the source page' do
        it 'returns false' do
          [
            page1.id,
            page2.id,
            page3.id
          ].each do |bad_page_id|
            page3.update! logic: { 'next_page_id' => bad_page_id }, required: true

            expect(form_logic.valid?).to be false
            expect(page1.errors).to be_empty
            expect(question1.errors).to be_empty
            expect(page2.errors).to be_empty
            expect(question1.errors).to be_empty
            expect(page3.errors.messages.to_h).to eq({
              logic: ['has target before source']
            })
            expect(page3.errors.details).to eq({
              logic: [{ error: :target_before_source_not_allowed, value: bad_page_id }]
            })
            expect(page4.errors).to be_empty
            expect(page5.errors).to be_empty
          end
        end
      end

      context 'when logic has a target that is not a page' do
        it 'returns false' do
          invalid_next_page_id = question2.id
          bad_logic = { 'next_page_id' => invalid_next_page_id }
          page1.update! logic: bad_logic, required: true

          expect(form_logic.valid?).to be false
          expect(page1.errors.messages.to_h).to eq({
            logic: ['has target that is not a page']
          })
          expect(page1.errors.details).to eq({
            logic: [{ error: :only_page_allowed_as_target, value: invalid_next_page_id }]
          })
        end
      end
    end
  end

  describe '#replace_temp_ids_in_field_logic!' do
    let(:page1) { fields[2] }
    let(:question1) { fields[3] }
    let(:option1) { question1.options[0] }
    let(:option2) { question1.options[1] }
    let(:page2) { fields[4] }
    let(:last_page) { fields[8] }

    before do
      question1.update!(logic: {
        'rules' => [
          { 'if' => option1.id, 'goto_page_id' => page2.id },
          { 'if' => 'NON_EXISTENT_ID', 'goto_page_id' => page2.id }
        ]
      })
    end

    it 'silently removes rules on select fields with option ids that do not exist' do
      form_logic.replace_temp_ids!({}, {})

      expect(question1.reload.logic).to eq('rules' => [{ 'if' => option1.id, 'goto_page_id' => page2.id }])
    end

    it 'keeps the second of two consecutive rules with unknown options (currently existing bug, B5)' do
      question1.update!(logic: { 'rules' => [
        { 'if' => 'UNKNOWN_1', 'goto_page_id' => page2.id },
        { 'if' => 'UNKNOWN_2', 'goto_page_id' => page2.id },
        { 'if' => option1.id, 'goto_page_id' => page2.id }
      ] })

      form_logic.replace_temp_ids!({}, {})

      expect(question1.reload.logic['rules'].pluck('if')).to eq ['UNKNOWN_2', option1.id]
    end

    it 'keeps no_answer on an optional select and drops it on a required select' do
      rules = [{ 'if' => 'no_answer', 'goto_page_id' => page2.id }, { 'if' => 'any_other_answer', 'goto_page_id' => page2.id }]
      question1.update!(required: false, logic: { 'rules' => rules })
      form_logic.replace_temp_ids!({}, {})
      expect(question1.reload.logic['rules'].pluck('if')).to eq %w[no_answer any_other_answer]

      question1.update!(required: true, logic: { 'rules' => rules })
      described_class.new(fields.map(&:reload)).replace_temp_ids!({}, {})
      expect(question1.reload.logic['rules'].pluck('if')).to eq %w[any_other_answer]
    end

    it 'replaces temp ids of options and pages' do
      question1.update!(logic: { 'rules' => [{ 'if' => 'TEMP-ID-OPTION', 'goto_page_id' => 'TEMP-ID-PAGE' }] })

      form_logic.replace_temp_ids!({ 'TEMP-ID-PAGE' => last_page.id }, { 'TEMP-ID-OPTION' => option2.id })

      expect(question1.reload.logic).to eq('rules' => [{ 'if' => option2.id, 'goto_page_id' => last_page.id }])
    end

    it 'does not check the values of linear scale rules (currently existing bug, B14)' do
      scale = fields[1]
      scale.update!(logic: { 'rules' => [{ 'if' => 99, 'goto_page_id' => page2.id }, { 'if' => '2', 'goto_page_id' => page2.id }] })

      form_logic.replace_temp_ids!({}, {})

      expect(scale.reload.logic['rules'].pluck('if')).to eq [99, '2']
      expect(form_logic).to be_valid
    end

    it 'replaces a temp id in page logic and leaves unknown ids as they are' do
      page1.update!(logic: { 'next_page_id' => 'TEMP-ID-PAGE' })
      fields[0].update!(logic: { 'next_page_id' => 'TEMP-ID-UNKNOWN' })

      form_logic.replace_temp_ids!({ 'TEMP-ID-PAGE' => last_page.id }, {})

      expect(page1.reload.logic).to eq('next_page_id' => last_page.id)
      expect(fields[0].reload.logic).to eq('next_page_id' => 'TEMP-ID-UNKNOWN')
    end
  end

  describe '#remove_select_logic_option_from_custom_fields' do
    let(:question) { fields[3] }
    let(:option1) { question.options[0] }
    let(:option2) { question.options[1] }
    let(:target) { fields[4] }

    it 'removes only the rules of the given option' do
      question.update!(logic: { 'rules' => [
        { 'if' => option1.id, 'goto_page_id' => target.id },
        { 'if' => option2.id, 'goto_page_id' => target.id },
        { 'if' => 'any_other_answer', 'goto_page_id' => target.id }
      ] })

      described_class.new([question]).remove_select_logic_option_from_custom_fields(option1)

      expect(question.reload.logic['rules'].pluck('if')).to eq [option2.id, 'any_other_answer']
    end

    it 'leaves a field without logic untouched' do
      expect { described_class.new([question]).remove_select_logic_option_from_custom_fields(option1) }
        .not_to(change { question.reload.updated_at })
    end
  end
end

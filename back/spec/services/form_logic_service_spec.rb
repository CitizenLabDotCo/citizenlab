# frozen_string_literal: true

require 'rails_helper'

describe FormLogicService do
  subject(:form_logic) { described_class.new fields }

  let(:form) { create(:custom_form) }
  let(:fields) do
    # Guarantee correct values for `ordering` attribute.
    [
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_linear_scale, :for_custom_form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form)
    ]
  end

  describe '#ui_schema_rules_for' do
    let(:page1) { fields[0] }
    let(:question1) { fields[1] }
    let(:page2) { fields[2] }
    let(:question2) { fields[3] }
    let(:page3) { fields[4] }
    let(:page4) { fields[5] }
    let(:page5) { fields[6] }
    let(:value) { 1 }

    context 'when there is no logic' do
      before do
        question1.update!(logic: {})
      end

      it 'returns a UI schema without rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to be_nil
        expect(form_logic.ui_schema_rules_for(page4)).to be_nil
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when an answer triggers going to a page' do
      before do
        question1.update!(logic: {
          'rules' => [{ 'if' => value, 'goto_page_id' => page4.id }]
        })
      end

      it 'returns a UI schema rules with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page4)).to be_nil
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when an answer triggers going to the next page' do
      before do
        question1.update!(logic: {
          'rules' => [{ 'if' => value, 'goto_page_id' => page2.id }]
        })
      end

      it 'returns a UI schema without rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to be_nil
        expect(form_logic.ui_schema_rules_for(page4)).to be_nil
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when an answer triggers going to the last page' do
      before do
        question1.update!(logic: {
          'rules' => [{ 'if' => value, 'goto_page_id' => page5.id }]
        })
      end

      it 'returns a UI schema rules with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page4)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end
  end

  describe '#valid?' do
    let(:page1) { fields[0] }
    let(:question1) { fields[1] }
    let(:page2) { fields[2] }
    let(:question2) { fields[3] }
    let(:page3) { fields[4] }
    let(:page4) { fields[5] }
    let(:page5) { fields[6] }

    context 'when logic has a good structure' do
      it 'returns true' do
        [
          {},
          { 'rules' => [] },
          { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] },
          { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] },
          { 'rules' => [{ 'if' => 1, 'goto' => 'end_page' }] },
          { 'rules' => [
            { 'if' => 1, 'goto_page_id' => page2.id },
            { 'if' => 2, 'goto_page_id' => page4.id }
          ] }
        ].each do |good_logic|
          question1.update! logic: good_logic

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
          { 'if' => 1, 'goto' => 'end_page' },
          { 'if' => 2, 'goto_page_id' => page4.id }
        ] }
      end

      it 'returns true' do
        question1.update! logic: logic_for_question1
        question2.update! logic: logic_for_question2

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
          question1.update! logic: bad_logic
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
          { 'if' => 1, 'goto' => 'end_page' },
          { 'if' => 2 }
        ] }
      end

      it 'returns true' do
        question1.update! logic: logic_for_question1
        question2.update! logic: logic_for_question2

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
          question1.update! logic: bad_logic

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
          question1.update! logic: bad_logic

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
          question1.update! logic: bad_logic

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

    context 'when the source field is a page' do
      it 'returns false' do
        page1.update!(
          logic: { 'rules' => [{ 'if' => 1, 'goto_page_id' => page3.id }] }
        )

        expect(form_logic.valid?).to be false
        expect(page1.errors.messages.to_h).to eq({
          logic: ['is not allowed on pages']
        })
        expect(page1.errors.details).to eq({
          logic: [{ error: :page_not_allowed_as_source }]
        })
      end
    end
  end
end

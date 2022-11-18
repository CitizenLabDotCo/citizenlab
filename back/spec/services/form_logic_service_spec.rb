# frozen_string_literal: true

require 'rails_helper'

describe FormLogicService do
  subject(:form_logic) { described_class.new fields }

  # TODO
  # - one value attribute present, others nil

  describe '#valid?' do
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
    let(:front_page) { fields[0] }
    let(:field1) { fields[1] }
    let(:target_page1) { fields[2] }
    let(:field2) { fields[3] }
    let(:target_page2) { fields[4] }
    let(:target_page3) { fields[5] }
    let(:target_page4) { fields[6] }

    context 'when logic has a good structure' do
      it 'returns true' do
        [
          {},
          { 'rules' => [] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page1.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'hide', 'target_id' => target_page1.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'submit_survey' }] }] },
          { 'rules' => [
            {
              'if' => 123,
              'then' => [
                { 'effect' => 'show', 'target_id' => target_page1.id },
                { 'effect' => 'hide', 'target_id' => target_page2.id }
              ]
            },
            {
              'if' => 456,
              'then' => [
                { 'effect' => 'show', 'target_id' => target_page3.id },
                { 'effect' => 'hide', 'target_id' => target_page4.id }
              ]
            }
          ] }
        ].each do |good_logic|
          field1.update! logic: good_logic

          expect(form_logic.valid?).to be true
          expect(field1.errors).to be_empty
          expect(field2.errors).to be_empty
        end
      end
    end

    context 'when all logic in multiple fields have good structure' do
      let(:logic_for_field1) do
        { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page1.id }] }] }
      end
      let(:logic_for_field2) do
        { 'rules' => [
          {
            'if' => 123,
            'then' => [{ 'effect' => 'submit_survey' }]
          },
          {
            'if' => 456,
            'then' => [
              { 'effect' => 'show', 'target_id' => target_page3.id },
              { 'effect' => 'hide', 'target_id' => target_page4.id }
            ]
          }
        ] }
      end

      it 'returns true' do
        field1.update! logic: logic_for_field1
        field2.update! logic: logic_for_field2

        expect(form_logic.valid?).to be true
        expect(field1.errors).to be_empty
        expect(field2.errors).to be_empty
      end
    end

    context 'when logic has a bad structure' do
      it 'returns false' do
        [
          { 'bad' => [] },
          { 'rules' => [], 'bad' => [] },
          { 'rules' => [{}] },
          { 'rules' => [{ 'test' => {} }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{}], 'bad' => {} }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show' }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page1.id, 'bad' => 'bad' }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'bad', 'target_id' => target_page1.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'submit_survey', 'target_id' => target_page1.id }] }] },
          { 'rules' => [
            {
              'if' => 123,
              'then' => [
                { 'effect' => 'show', 'target_id' => '123' },
                { 'effect' => 'hide', 'target_id' => '456' }
              ]
            },
            {
              'if' => 456,
              'then' => [
                { 'effect' => 'show', 'target_id' => '666' },
                { 'effect' => 'hide' }
              ]
            }
          ] }
        ].each do |bad_logic|
          field1.update! logic: bad_logic
          expect(form_logic.valid?).to be false
          # expect(field1.errors.details).to eq "todo"
        end
      end
    end

    context 'when some logic in multiple fields has bad structure' do
      let(:logic_for_field1) do
        { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page1.id }] }] }
      end
      let(:logic_for_field2) do
        { 'rules' => [
          {
            'if' => 123,
            'then' => [{ 'effect' => 'submit_survey' }]
          },
          {
            'if' => 456,
            'then' => [
              { 'effect' => 'show' }, # Missing target ID
              { 'effect' => 'hide', 'target_id' => target_page4.id }
            ]
          }
        ] }
      end

      it 'returns true' do
        field1.update! logic: logic_for_field1
        field2.update! logic: logic_for_field2

        expect(form_logic.valid?).to be false
        expect(field1.errors).to be_empty
        # expect(field2.errors.details).to eq "todo"
      end
    end

    context 'when logic has invalid target IDs' do
      it 'returns false' do
        [
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => create(:custom_field_page).id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [
            { 'effect' => 'show', 'target_id' => target_page1.id },
            { 'effect' => 'hide', 'target_id' => create(:custom_field_page).id }
          ] }] },
          { 'rules' => [
            { 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page1.id }] },
            { 'if' => 321, 'then' => [{ 'effect' => 'show', 'target_id' => create(:custom_field_page).id }] }
          ] }
        ].each do |bad_logic|
          field1.update! logic: bad_logic

          expect(form_logic.valid?).to be false
          # expect(field1.errors.details).to eq "todo"
        end
      end
    end

    context 'when logic has target pages that occur before the source field1' do
      it 'returns false' do
        [
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => front_page.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [
            { 'effect' => 'show', 'target_id' => target_page1.id },
            { 'effect' => 'hide', 'target_id' => front_page.id }
          ] }] }
        ].each do |bad_logic|
          field1.update! logic: bad_logic

          expect(form_logic.valid?).to be false
          # expect(field1.errors.details).to eq "todo"
        end
      end
    end

    context 'when logic has target fields that are not pages' do
      it 'returns false' do
        [
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => field2.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [
            { 'effect' => 'show', 'target_id' => target_page1.id },
            { 'effect' => 'hide', 'target_id' => field2.id }
          ] }] }
        ].each do |bad_logic|
          field1.update! logic: bad_logic

          expect(form_logic.valid?).to be false
          # expect(field1.errors.details).to eq "todo"
        end
      end
    end

    context 'when the source field1 is a page' do
      it 'returns false' do
        front_page.update!(
          logic: { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page2.id }] }] }
        )

        expect(form_logic.valid?).to be false
        # expect(field1.errors.details).to eq "todo"
      end
    end
  end
end

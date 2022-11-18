# frozen_string_literal: true

require 'rails_helper'

describe FormLogicService do
  let(:form_logic) { described_class.new fields }
  let(:target_page) { create :custom_field_page, :for_custom_form, resource: field.resource }
  let(:fields) { [field, target_page] }
  let(:logic) { {} }

  # - source and target fields same custom form
  # - source field cannot be page, target field must be page
  # - source field before target field
  # - condition_operator present and inclusion from list
  # - one value attribute present, others nil
  # - action present and inclusion from list

  describe '#valid?' do
    let(:field) do
      create(
        :custom_field_linear_scale,
        :for_custom_form,
        logic: logic
      )
    end

    context 'returns true when logic has a good structure' do
      let(:target_page2) { create :custom_field_page, :for_custom_form, resource: field.resource }
      let(:target_page3) { create :custom_field_page, :for_custom_form, resource: field.resource }
      let(:target_page4) { create :custom_field_page, :for_custom_form, resource: field.resource }
      let(:fields) { [field, target_page, target_page2, target_page3, target_page4] }

      it 'returns true' do
        [
          {},
          { 'rules' => [] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'hide', 'target_id' => target_page.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'submit_survey' }] }] },
          { 'rules' => [
            {
              'if' => 123,
              'then' => [
                { 'effect' => 'show', 'target_id' => target_page.id },
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
          field.update! logic: good_logic

          expect(form_logic.valid?).to be true
          expect(field.errors).to be_empty
        end
      end
    end

    [ # TODO: replace target ids
      { 'bad' => [] },
      { 'rules' => [], 'bad' => [] },
      { 'rules' => [{}] },
      { 'rules' => [{ 'test' => {} }] },
      { 'rules' => [{ 'if' => 123, 'then' => [{}], 'bad' => {} }] },
      { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show' }] }] },
      { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => '123', 'bad' => 'bad' }] }] },
      { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'bad', 'target_id' => '123' }] }] },
      { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'submit_survey', 'target_id' => '123' }] }] },
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
      context "when logic has bad structure #{bad_logic}" do
        let(:logic) { bad_logic }

        it 'returns false' do
          expect(form_logic.valid?).to be false
          # expect(field.errors.details).to eq "todo"
        end
      end
    end

    context 'when logic has invalid target IDs' do
      it 'returns false' do
        [
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => create(:custom_field_page).id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [
            { 'effect' => 'show', 'target_id' => target_page.id },
            { 'effect' => 'hide', 'target_id' => create(:custom_field_page).id }
          ] }] },
          { 'rules' => [
            { 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page.id }] },
            { 'if' => 321, 'then' => [{ 'effect' => 'show', 'target_id' => create(:custom_field_page).id }] }
          ] }
        ].each do |bad_logic|
          field.update! logic: bad_logic

          expect(form_logic.valid?).to be false
          # expect(field.errors.details).to eq "todo"
        end
      end
    end

    context 'when logic has target pages that occur before the source field' do
      let(:front_page) { create(:custom_field_page, :for_custom_form, resource: field.resource).tap(&:move_to_top) }
      let(:fields) { [front_page, field, target_page] }

      it 'returns false' do
        [
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => front_page.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [
            { 'effect' => 'show', 'target_id' => target_page.id },
            { 'effect' => 'hide', 'target_id' => front_page.id }
          ] }] }
        ].each do |bad_logic|
          field.update! logic: bad_logic

          expect(form_logic.valid?).to be false
          # expect(field.errors.details).to eq "todo"
        end
      end
    end

    context 'when logic has target fields that are not pages' do
      let(:end_field) { create :custom_field, :for_custom_form, resource: field.resource }
      let(:fields) { [field, target_page, end_field] }

      it 'returns false' do
        [
          { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => end_field.id }] }] },
          { 'rules' => [{ 'if' => 123, 'then' => [
            { 'effect' => 'show', 'target_id' => target_page.id },
            { 'effect' => 'hide', 'target_id' => end_field.id }
          ] }] }
        ].each do |bad_logic|
          field.update! logic: bad_logic

          expect(form_logic.valid?).to be false
          # expect(field.errors.details).to eq "todo"
        end
      end
    end

    context 'when the source field is a page' do
      let(:field) { create :custom_field_page, :for_custom_form }

      it 'returns false' do
        field.update!(
          logic: { 'rules' => [{ 'if' => 123, 'then' => [{ 'effect' => 'show', 'target_id' => target_page.id }] }] }
        )

        expect(form_logic.valid?).to be false
        # expect(field.errors.details).to eq "todo"
      end
    end
  end
end

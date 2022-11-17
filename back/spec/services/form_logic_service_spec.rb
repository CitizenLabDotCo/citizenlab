# frozen_string_literal: true

require 'rails_helper'

describe FormLogicService do
  let(:form_logic) { described_class.new fields }
  let(:fields) { [field] }

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

    [
      {},
      { 'rules' => [] },
      { 'rules' => [{ 'if' => 123, 'then' => [ { 'effect' => 'show', 'target_id' => '123' }] }] },
      { 'rules' => [{ 'if' => 123, 'then' => [ { 'effect' => 'hide', 'target_id' => '123' }] }] },
      { 'rules' => [{ 'if' => 123, 'then' => [ { 'effect' => 'submit_survey' }] }] },
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
            { 'effect' => 'hide', 'target_id' => '777' }
          ]
        }
      ] }
    ].each do |good_logic|
      context "when logic has good structure #{good_logic}" do
        let(:logic) { good_logic }

        it 'returns true' do
          expect(form_logic.valid?).to be true
          expect(field.errors).to be_empty
        end
      end
    end

    [
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

    # context 'when logic has bad structure' do
    #   let(:logic) { { rules: [{}] } }
    #   let(:logic) { { rules: [{ 'test' => {} }] } }

    #   it 'returns false' do
    #     expect(form_logic.valid?).to be false
    #     # expect(field.errors.details).to eq "todo"
    #   end
    # end
  end
end

# good
# {}
# { rules: [] }
# {
#   rules: [
#     {
#       if: 1,
#       then: [
#         {
#           effect: 'hide',
#           target_id: 'adgajshgdj'
#         }
#       ]
#     }
#   ]
# }
# bad
# nil
# { rules: [{}] }

# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldOptionService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'before_destroy' do
    let(:custom_field) { create(:custom_field, :for_custom_form, input_type: 'select') }
    let(:option1) { create(:custom_field_option, custom_field: custom_field, key: 'option_1') }
    let!(:user1) { create(:user, custom_field_values: { custom_field.key => 'option_1' }) }

    context 'when non-user-related custom field option is deleted' do
      it 'does not delete user custom_field_value(s) with key identical to deleted option key', document: false do
        service.before_destroy(option1, user)

        expect(user1.reload.custom_field_values).to eq({ custom_field.key => 'option_1' })
      end
    end
  end

  describe 'after_destroy' do
    let(:custom_field1) { create(:custom_field, :for_custom_form, input_type: 'select') }
    let(:custom_field2) { create(:custom_field, :for_custom_form, input_type: 'page', page_layout: 'default') }
    let(:custom_field3) { create(:custom_field, :for_custom_form, input_type: 'page', page_layout: 'default') }
    let(:option1) { create(:custom_field_option, custom_field: custom_field1, key: 'option_1') }
    let(:option2) { create(:custom_field_option, custom_field: custom_field1, key: 'option_2') }
    let(:logic) do
      { rules: [
        { if: option1.id, goto_page_id: custom_field2.id },
        { if: option2.id, goto_page_id: custom_field3.id }
      ] }
    end

    before do
      custom_field1.update!(logic: logic)
    end

    context 'when custom field option that is a survey logic option is destroyed' do
      it 'removes the logic option from custom fields that contain it' do
        service.after_destroy(option1, user)

        expect(custom_field1.reload.logic['rules'].count).to eq 1
        expect(custom_field1.reload.logic['rules'].pluck('if')).to eq [option2.id]
      end
    end
  end
end

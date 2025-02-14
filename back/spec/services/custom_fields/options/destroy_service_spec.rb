# frozen_string_literal: true

require 'rails_helper'

describe CustomFields::Options::DestroyService do
  let(:service) { described_class.new }
  let(:current_user) { create(:user) }

  describe '#destroy!' do
    context 'when deleting a custom-form field option that has the same key as a user field option' do
      let(:custom_field) { create(:custom_field, :for_custom_form, input_type: 'select') }
      let(:option) { create(:custom_field_option, custom_field: custom_field, key: 'same-option-key') }
      let!(:user) { create(:user, custom_field_values: { custom_field.key => 'same-option-key' }) }

      it 'does not update the custom field value of users' do
        service.destroy!(option, current_user)
        expect(user.reload.custom_field_values).to eq({ custom_field.key => 'same-option-key' })
      end
    end

    context 'when custom field option that is a survey logic option is destroyed' do
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

      it 'removes the logic option from custom fields that contain it' do
        service.destroy!(option1, current_user)

        expect(custom_field1.reload.logic['rules'].count).to eq 1
        expect(custom_field1.reload.logic['rules'].pluck('if')).to eq [option2.id]
      end
    end
  end
end

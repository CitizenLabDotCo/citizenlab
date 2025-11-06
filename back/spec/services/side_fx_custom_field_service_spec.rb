# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:field) { create(:custom_field) }

  describe 'before_update' do
    it 'swaps the text images' do
      expect_any_instance_of(TextImageService).to(
        receive(:swap_data_images_multiloc).with(field.description_multiloc, field: :description_multiloc, imageable: field).and_return(field.description_multiloc)
      )
      service.before_update field, user
    end
  end

  describe 'before_delete' do
    let(:custom_field) { create(:custom_field, :for_custom_form, input_type: 'select') }
    let!(:user1) { create(:user, custom_field_values: { custom_field.key => 'option_1' }) }
    let!(:user2) { create(:user, custom_field_values: { custom_field.key => 'option_2' }) }

    context 'when non-user custom field is deleted' do
      it 'does not delete user custom_field_value(s) with key identical to deleted custom field key', document: false do
        service.before_destroy(custom_field, user)

        expect(user1.reload.custom_field_values).to eq({ custom_field.key => 'option_1' })
        expect(user2.reload.custom_field_values).to eq({ custom_field.key => 'option_2' })
      end
    end
  end
end

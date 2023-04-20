# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldOptionService do
  let(:service) { described_class.new }
  let(:user) { create :user }

  describe 'before_delete' do
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
end

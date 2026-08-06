# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldService do
  let(:service) { described_class.new }

  let_it_be(:user, reload: true) { create(:user) }
  let_it_be(:field, reload: true) { create(:custom_field) }

  describe 'before_delete' do
    let_it_be(:custom_field, reload: true) { create(:custom_field, :for_custom_form, input_type: 'select') }
    let_it_be(:user1, reload: true) { create(:user, custom_field_values: { custom_field.key => 'option_1' }) }
    let_it_be(:user2, reload: true) { create(:user, custom_field_values: { custom_field.key => 'option_2' }) }

    context 'when non-user custom field is deleted' do
      it 'does not delete user custom_field_value(s) with key identical to deleted custom field key', document: false do
        service.before_destroy(custom_field, user)

        expect(user1.reload.custom_field_values).to eq({ custom_field.key => 'option_1' })
        expect(user2.reload.custom_field_values).to eq({ custom_field.key => 'option_2' })
      end
    end
  end
end

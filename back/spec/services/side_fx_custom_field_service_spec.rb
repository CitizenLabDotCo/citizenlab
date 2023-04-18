# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldService do
  let(:service) { described_class.new }
  let(:user) { create :user }
  let(:field) { create :custom_field }

  describe 'after_create' do
    it 'swaps the text images' do
      expect_any_instance_of(TextImageService).to(
        receive(:swap_data_images).with(field, :description_multiloc).and_return(field.description_multiloc)
      )
      service.after_create field, user
    end
  end

  describe 'before_update' do
    it 'swaps the text images' do
      expect_any_instance_of(TextImageService).to(
        receive(:swap_data_images).with(field, :description_multiloc).and_return(field.description_multiloc)
      )
      service.before_update field, user
    end
  end

  describe 'before_destroy' do
    let(:custom_field) { create(:custom_field_multiselect, resource_type: 'User') }
    let(:option1) { create(:custom_field_option, custom_field: custom_field, key: 'english') }
    let(:option2) { create(:custom_field_option, custom_field: custom_field, key: 'french') }

    let(:user1) { create(:user, custom_field_values: { custom_field.key => [option1.key, option2.key] }) }
    let(:user2) { create(:user, custom_field_values: { custom_field.key => [option1.key] }) }
    let(:user3) { create(:user, custom_field_values: { custom_field.key => [option2.key] }) }

    let(:custom_field_for_form) { create(:custom_field, :for_custom_form, input_type: 'select') }
    let!(:user4) { create(:user, custom_field_values: { custom_field_for_form.key => 'option_1' }) }
    let!(:user5) { create(:user, custom_field_values: { custom_field_for_form.key => 'option_2' }) }

    it 'logs the related user data that will be destroyed' do
      travel_to Time.now do
        expect { service.before_destroy(custom_field, user) }
          .to enqueue_job(LogActivityJob)
          .with(
            service.encode_frozen_resource(custom_field),
            'deletion_initiated',
            user,
            Time.now.to_i,
            payload: {
              explanation: 'if this deletion succeeded, these users lost this data from custom_field_values',
              log_user_ids_deleted_custom_field_values: {
                user1.id => { custom_field.key.to_s => [option1.key, option2.key] },
                user2.id => { custom_field.key.to_s => [option1.key] },
                user3.id => { custom_field.key.to_s => [option2.key] }
              }
            }
          )
          .exactly(1).times
      end
    end

    context 'when non-user custom field is deleted' do
      it 'does not delete user custom_field_value(s) with key identical to deleted custom field key', document: false do
        service.before_destroy(custom_field_for_form, user)

        expect(user4.reload.custom_field_values).to eq({ custom_field_for_form.key => 'option_1' })
        expect(user5.reload.custom_field_values).to eq({ custom_field_for_form.key => 'option_2' })
      end
    end
  end
end

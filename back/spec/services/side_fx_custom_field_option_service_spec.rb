# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldOptionService do
  let!(:service) { described_class.new }
  let!(:user) { create :user }

  describe 'before_destroy' do
    let!(:custom_field) { create(:custom_field_multiselect, resource_type: 'User') }
    let!(:option1) { create(:custom_field_option, custom_field: custom_field, key: 'english') }
    let!(:option2) { create(:custom_field_option, custom_field: custom_field, key: 'french') }

    let!(:user1) { create(:user, custom_field_values: { custom_field.key => [option1.key, option2.key] }) }
    let!(:user2) { create(:user, custom_field_values: { custom_field.key => [option1.key] }) }
    let!(:user3) { create(:user, custom_field_values: { custom_field.key => [option2.key] }) }

    it 'logs the related user data that will be destroyed' do
      travel_to Time.now do
        expect { service.before_destroy(option1, user) }
          .to enqueue_job(LogActivityJob)
          .with(
            service.encode_frozen_resource(option1),
            'deletion_initiated',
            user,
            Time.now.to_i,
            payload: {
              explanation: 'if this deletion succeeded, these users lost this data from custom_field_values',
              log_user_ids_deleted_custom_field_values: {
                user1.id => { custom_field.key.to_s => [option1.key] },
                user2.id => { custom_field.key.to_s => [option1.key] }
              }
            }
          )
          .exactly(1).times
      end
    end
  end
end

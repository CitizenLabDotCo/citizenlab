# frozen_string_literal: true

class SideFxCustomFieldService
  include SideFxHelper

  def before_create(custom_field, current_user); end

  def after_create(custom_field, current_user)
    custom_field.update! description_multiloc: TextImageService.new.swap_data_images(custom_field, :description_multiloc)
    LogActivityJob.perform_later(custom_field, 'created', current_user, custom_field.created_at.to_i)
  end

  def before_update(custom_field, _current_user)
    custom_field.description_multiloc = TextImageService.new.swap_data_images(custom_field, :description_multiloc)
  end

  def after_update(custom_field, current_user)
    LogActivityJob.perform_later(custom_field, 'changed', current_user, custom_field.updated_at.to_i)
  end

  def before_destroy(custom_field, current_user)
    # First, we log the User custom_field_values that will be deleted, if we are deleting a User custom_field
    if custom_field.resource_type == 'User'
      related_user_data = {}
      User.where("custom_field_values ? '#{custom_field.key}'").each do |user|
        related_user_data[user.id] = { custom_field.key.to_s => user.custom_field_values[custom_field.key] }
      end

      LogActivityJob.perform_now(
        encode_frozen_resource(custom_field),
        'deletion_initiated',
        current_user,
        Time.now.to_i,
        payload: {
          explanation: 'if this deletion succeeded, these users lost this data from custom_field_values',
          log_user_ids_deleted_custom_field_values: related_user_data
        }
      )
    end

    # Then, we delete the User custom_field_values
    UserCustomFieldService.new.delete_custom_field_values(custom_field)
  end

  def after_destroy(frozen_custom_field, current_user)
    serialized_custom_field = clean_time_attributes(frozen_custom_field.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_custom_field),
      'deleted',
      current_user,
      Time.now.to_i,
      payload: { custom_field: serialized_custom_field }
    )
  end
end

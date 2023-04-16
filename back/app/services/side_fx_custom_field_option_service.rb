# frozen_string_literal: true

class SideFxCustomFieldOptionService
  include SideFxHelper

  def before_create(custom_field_option, current_user); end

  def after_create(custom_field_option, current_user)
    LogActivityJob.perform_later(custom_field_option, 'created', current_user, custom_field_option.created_at.to_i)
  end

  def before_update(custom_field_option, current_user); end

  def after_update(custom_field_option, current_user)
    LogActivityJob.perform_later(custom_field_option, 'changed', current_user, custom_field_option.updated_at.to_i)
  end

  def before_destroy(custom_field_option, current_user)
    custom_field = custom_field_option.custom_field
    return unless custom_field.resource_type == 'User'

    log_user_data_that_will_be_deleted(custom_field_option, custom_field, current_user)
    UserCustomFieldService.new.delete_custom_field_option_values(custom_field_option.key, custom_field)
  end

  def after_destroy(frozen_custom_field_option, current_user)
    serialized_custom_field_option = clean_time_attributes(frozen_custom_field_option.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_custom_field_option),
      'deleted',
      current_user,
      Time.now.to_i,
      payload: { custom_field_option: serialized_custom_field_option }
    )
  end

  private

  def log_user_data_that_will_be_deleted(custom_field_option, custom_field, current_user)
    related_user_data = {}
    if custom_field.input_type == 'multiselect'
      User.where(
        "(custom_field_values->>'#{custom_field.key}')::jsonb ? :value", value: custom_field_option.key
      ).each do |user|
        related_user_data[user.id] = { custom_field.key.to_s => "[#{custom_field_option.key}]" }
      end
    else
      User.where("custom_field_values ? '#{custom_field.key}'").each do |user|
        related_user_data[user.id] = { custom_field.key.to_s => user.custom_field_values[custom_field.key] }
      end
    end

    LogActivityJob.perform_now(
      encode_frozen_resource(custom_field_option),
      'deletion_initiated',
      current_user,
      Time.now.to_i,
      payload: {
        explanation: 'if this deletion succeeded, these users lost this data from custom_field_values',
        log_user_ids_deleted_custom_field_values: related_user_data
      }
    )
  end
end

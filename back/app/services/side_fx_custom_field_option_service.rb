class SideFxCustomFieldOptionService
  include SideFxHelper

  def before_create custom_field_option, current_user

  end

  def after_create custom_field_option, current_user
    LogActivityJob.perform_later(custom_field_option, "created", current_user, custom_field_option.created_at.to_i)
  end

  def after_update custom_field_option, current_user
    LogActivityJob.perform_later(custom_field_option, 'changed', current_user, custom_field_option.updated_at.to_i)
  end

  def before_destroy custom_field_option, current_user
    UserCustomFieldService.new.delete_custom_field_option_values custom_field_option.key, custom_field_option.custom_field
  end

  def after_destroy frozen_custom_field_option, current_user
    serialized_custom_field_option = clean_time_attributes(frozen_custom_field_option.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_custom_field_option), 
      "deleted", 
      current_user, 
      Time.now.to_i, 
      payload: {custom_field_option: serialized_custom_field_option}
    )
  end
end
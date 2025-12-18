# frozen_string_literal: true

class SideFxCustomFieldService
  include SideFxHelper

  def before_create(custom_field, current_user); end

  def after_create(custom_field, current_user)
    LogActivityJob.perform_later(custom_field, 'created', current_user, custom_field.created_at.to_i)
  end

  def after_update(custom_field, current_user)
    LogActivityJob.perform_later(custom_field, 'changed', current_user, custom_field.updated_at.to_i)
  end

  def before_destroy(custom_field, _current_user)
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

SideFxCustomFieldService.prepend(Analysis::Patches::SideFxCustomFieldService)

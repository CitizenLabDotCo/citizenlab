# frozen_string_literal: true

class SideFxPermissionsCustomFieldService
  include SideFxHelper

  def before_create(_permissions_custom_field, _user); end

  def after_create(permissions_custom_field, user)
    LogActivityJob.perform_later permissions_custom_field, 'created', user, permissions_custom_field.created_at.to_i
  end

  def before_update(_permissions_custom_field, _user); end

  def after_update(permissions_custom_field, user)
    LogActivityJob.perform_later permissions_custom_field, 'changed', user, permissions_custom_field.updated_at.to_i
  end

  def before_destroy(_permissions_custom_field, user); end

  def after_destroy(frozen_permissions_custom_field, user)
    serialized_permissions_custom_field = clean_time_attributes frozen_permissions_custom_field.attributes
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_permissions_custom_field),
      'deleted',
      user,
      Time.now.to_i,
      payload: { permissions_custom_field: serialized_permissions_custom_field }
    )
  end
end

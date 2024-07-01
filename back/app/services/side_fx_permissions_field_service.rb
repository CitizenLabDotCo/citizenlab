# frozen_string_literal: true

class SideFxPermissionsFieldService
  include SideFxHelper

  def before_create(_permissions_field, _user); end

  def after_create(permissions_field, user)
    LogActivityJob.perform_later permissions_field, 'created', user, permissions_field.created_at.to_i
  end

  def before_update(_permissions_field, _user); end

  def after_update(permissions_field, user)
    LogActivityJob.perform_later permissions_field, 'changed', user, permissions_field.updated_at.to_i
  end

  def before_destroy(_permissions_field, user); end

  def after_destroy(frozen_permissions_field, user)
    serialized_permissions_field = clean_time_attributes frozen_permissions_field.attributes
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_permissions_field),
      'deleted',
      user,
      Time.now.to_i,
      payload: { permissions_field: serialized_permissions_field }
    )
  end
end

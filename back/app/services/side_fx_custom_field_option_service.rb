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
end

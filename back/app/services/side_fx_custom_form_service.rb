# frozen_string_literal: true

class SideFxCustomFormService
  include SideFxHelper

  def after_update(custom_form, current_user, payload)
    LogActivityJob.perform_later(custom_form, 'changed', current_user, custom_form.updated_at.to_i, payload: payload)
  end
end


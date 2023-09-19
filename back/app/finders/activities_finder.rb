# frozen_string_literal: true

class ActivitiesFinder < ApplicationFinder
  private

  def post_condition(param)
    return if param.blank?

    where(item_id: param[:id], item_type: param[:type])
  end

  def action_condition(actions)
    where(action: actions)
  end
end

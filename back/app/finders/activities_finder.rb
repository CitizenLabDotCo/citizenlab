class ActivitiesFinder < ApplicationFinder
  default_sort acted_at: :asc

  sortable_attributes :acted_at

  private

  def post_condition(param)
    return if param.blank?

    where(item_id: param[:id], item_type: param[:type])
  end

  def action_condition(actions)
    where(action: actions)
  end
end

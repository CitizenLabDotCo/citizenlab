class ActivitiesFinder < ApplicationFinder
  default_sort acted_at: :asc

  sortable_attributes :acted_at

  private

  def post_condition(param)
    return unless param.any?

    where(item_id: param.dig(:id), item_type: param.dig(:type))
  end

  def action_condition(actions)
    where(action: actions)
  end
end

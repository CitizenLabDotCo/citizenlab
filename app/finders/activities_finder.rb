class ActivitiesFinder < ApplicationFinder
  default_sort acted_at: :asc

  sortable_attributes :acted_at

  private

  def post_condition(id:, type:)
    where(item_id: id, item_type: type)
  end

  def action_condition(actions)
    where(action: actions)
  end
end

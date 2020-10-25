class ActivitiesFinder < ApplicationFinder
  default_sort acted_at: :asc

  sortable_attributes :acted_at

  private

  def post_condition(post_type)
    id = params.dig("#{post_type.underscore}_id")
    where(item_id: id, item_type: post_type)
  end

  def action_condition(actions)
    where(action: actions)
  end
end

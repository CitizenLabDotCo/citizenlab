# This migration comes from idea_assignment (originally 20190905123110)
class AddAssignedAtToIdeas < ActiveRecord::Migration[5.2]
  def change
    return if column_exists? :ideas, :assigned_at

    add_column :ideas, :assigned_at, :timestamp

    now = Time.zone.now
    Idea.where.not(assignee_id: nil).each do |idea|
      assigned_at = Activity.where(item: idea, action: 'changed_assignee').order(created_at: :desc).first&.created_at
      assigned_at ||= now
      idea.update_columns(assigned_at: assigned_at)
    end
  end
end

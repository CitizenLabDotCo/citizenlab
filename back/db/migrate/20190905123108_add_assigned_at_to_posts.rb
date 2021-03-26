class AddAssignedAtToPosts < ActiveRecord::Migration[5.2]
  def change
    add_column :ideas, :assigned_at, :timestamp
    add_column :initiatives, :assigned_at, :timestamp

    now = Time.now
    Idea.where('assignee_id IS NOT NULL').each do |idea|
      assigned_at = Activity.where(item: idea, action: 'changed_assignee').order(created_at: :desc).first&.created_at
      assigned_at ||= now
      idea.update_columns assigned_at: assigned_at
    end
    Initiative.where('assignee_id IS NOT NULL').each do |initiative|
      assigned_at = Activity.where(item: initiative, action: 'changed_assignee').order(created_at: :desc).first&.created_at
      assigned_at ||= now
      initiative.update_columns assigned_at: assigned_at
    end
  end
end

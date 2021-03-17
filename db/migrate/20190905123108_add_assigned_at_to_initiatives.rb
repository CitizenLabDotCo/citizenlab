class AddAssignedAtToInitiatives < ActiveRecord::Migration[5.2]
  def change
    return if column_exists? :initiatives, :assigned_at

    add_column :initiatives, :assigned_at, :timestamp

    now = Time.zone.now
    Initiative.where.not(assignee_id: nil).each do |initiative|
      assigned_at = Activity.where(item: initiative,
                                   action: 'changed_assignee').order(created_at: :desc).first&.created_at
      assigned_at ||= now
      initiative.update_columns assigned_at: assigned_at
    end
  end
end

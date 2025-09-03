class AddOwnerToJobsTrackers < ActiveRecord::Migration[7.1]
  def change
    add_reference :jobs_trackers, :owner, foreign_key: { to_table: :users }, type: :uuid
  end
end

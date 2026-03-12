# This migration comes from impact_tracking (originally 20260312100000)
class AddIndexesToPageviewsAndSessions < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    add_index :impact_tracking_pageviews, :session_id, algorithm: :concurrently
    add_index :impact_tracking_pageviews, :project_id, algorithm: :concurrently
    add_index :impact_tracking_pageviews, :created_at, algorithm: :concurrently
    add_index :impact_tracking_sessions, :highest_role, algorithm: :concurrently
    add_index :impact_tracking_sessions, :user_id, algorithm: :concurrently
  end
end

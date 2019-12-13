class AddModerationStatusToModeratables < ActiveRecord::Migration[5.2]
  def change
    add_column :ideas, :moderation_status, :string, default: 'unread'
    add_column :initiatives, :moderation_status, :string, default: 'unread'
    add_column :comments, :moderation_status, :string, default: 'unread'
  end
end

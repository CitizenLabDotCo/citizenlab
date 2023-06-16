# frozen_string_literal: true

class AddInternalCommentIdToNotifications < ActiveRecord::Migration[6.1]
  def change
    add_column :notifications, :internal_comment_id, :uuid, null: true
    add_foreign_key :notifications, :internal_comments, column: :internal_comment_id
    add_index :notifications, :internal_comment_id
  end
end

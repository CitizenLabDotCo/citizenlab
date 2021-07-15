# This migration comes from flag_inappropriate_content (originally 20210521090727)
class AddInappropriateContentFlagToNotifications < ActiveRecord::Migration[6.0]
  def change
    add_reference :notifications, :inappropriate_content_flag, foreign_key: {to_table: :flag_inappropriate_content_inappropriate_content_flags}, type: :uuid
  end
end

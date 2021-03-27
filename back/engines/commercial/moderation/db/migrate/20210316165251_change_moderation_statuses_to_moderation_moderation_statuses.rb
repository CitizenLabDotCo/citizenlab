class ChangeModerationStatusesToModerationModerationStatuses < ActiveRecord::Migration[6.0]
  def change
    rename_table :moderation_statuses, :moderation_moderation_statuses
  end
end

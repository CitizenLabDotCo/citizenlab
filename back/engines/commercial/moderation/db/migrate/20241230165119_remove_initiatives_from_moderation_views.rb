class RemoveInitiativesFromModerationViews < ActiveRecord::Migration[7.0]
  def change
    update_view :moderation_moderations, version: 4, revert_to_version: 3
  end
end

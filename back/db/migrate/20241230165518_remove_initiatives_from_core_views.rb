class RemoveInitiativesFromCoreViews < ActiveRecord::Migration[7.0]
  def change
    update_view :idea_trending_infos, version: 3, revert_to_version: 2
    drop_view :union_posts, revert_to_version: 3
    drop_view :initiative_initiative_statuses, revert_to_version: 1
  end
end

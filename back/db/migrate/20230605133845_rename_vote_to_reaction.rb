# frozen_string_literal: true

class RenameVoteToReaction < ActiveRecord::Migration[6.1]
  def change
    # TODO: This could cause errors temporarily on deployment when code is deployed but migrations are running
    #
    # votes
    rename_column :votes, :votable_id, :reactable_id
    rename_column :votes, :votable_type, :reactable_type
    rename_table :votes, :reactions

    # comments
    rename_column :comments, :upvotes_count, :likes_count
    rename_column :comments, :downvotes_count, :dislikes_count

    # ideas
    rename_column :ideas, :upvotes_count, :likes_count
    rename_column :ideas, :downvotes_count, :dislikes_count

    # initiatives
    # NOTE: Done for consistency even though initiatives will continue to use 'votes' in interface
    rename_column :initiatives, :upvotes_count, :likes_count
    rename_column :initiatives, :downvotes_count, :dislikes_count

    # phases
    rename_column :phases, :voting_enabled, :reacting_enabled
    rename_column :phases, :upvoting_method, :reacting_like_method
    rename_column :phases, :upvoting_limited_max, :reacting_like_limited_max
    rename_column :phases, :downvoting_enabled, :reacting_dislike_enabled
    rename_column :phases, :downvoting_method, :reacting_dislike_method
    rename_column :phases, :downvoting_limited_max, :reacting_dislike_limited_max

    # projects
    rename_column :projects, :voting_enabled, :reacting_enabled
    rename_column :projects, :upvoting_method, :reacting_like_method
    rename_column :projects, :upvoting_limited_max, :reacting_like_limited_max
    rename_column :projects, :downvoting_enabled, :reacting_dislike_enabled
    rename_column :projects, :downvoting_method, :reacting_dislike_method
    rename_column :projects, :downvoting_limited_max, :reacting_dislike_limited_max

    # views
    update_view :union_posts, version: 3, revert_to_version: 2
    update_view :idea_trending_infos, version: 2, revert_to_version: 1
  end
end

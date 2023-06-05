# frozen_string_literal: true

class RenameVoteToReaction < ActiveRecord::Migration[6.1]
  def change
    # TODO: This will cause errors temporarily on deployment when code is deployed but migrations are running
    # Could we create a view on old table name / old column names?
    #
    # votes
    # votes.votable_id
    # votes.votable_type
    rename_column :votes, :votable_id, :reactable_id
    rename_column :votes, :votable_type, :reactable_type
    rename_table :votes, :reactions

    # Refactor model and controller now

    # comments.upvotes_count
    # comments.downvotes_count
    # rename_column :comments, :upvotes_count, :reactions_up_count
    # rename_column :comments, :downvotes_count, :reactions_down_count

    # ideas.upvotes_count
    # ideas.downvotes_count
    # rename_column :ideas, :upvotes_count, :reactions_up_count
    # rename_column :ideas, :downvotes_count, :reactions_down_count

    # initiatives.upvotes_count?
    # initiatives.downvotes_count?
    # NOTE: Probably don't want to do initiatives? Or should we for consistency?

    # phases.voting_enabled
    # phases.upvoting_method
    # phases.upvoting_limited_max
    # phases.downvoting_enabled
    # phases.downvoting_method
    # phases.downvoting_limited_max
    # rename_column :phases, :voting_enabled, :reactions_up_enabled
    # rename_column :phases, :upvoting_method, :reactions_up_method
    # rename_column :phases, :upvoting_limited_max, :reactions_up_limited_max
    # rename_column :phases, :downvoting_enabled, :reactions_down_enabled
    # rename_column :phases, :downvoting_method, :reactions_down_method
    # rename_column :phases, :downvoting_limited_max, :reactions_down_limited_max

    # projects.voting_enabled
    # projects.upvoting_method
    # projects.upvoting_limited_max
    # projects.downvoting_enabled
    # projects.downvoting_method
    # projects.downvoting_limited_ma
    # rename_column :projects, :voting_enabled, :reactions_up_enabled
    # rename_column :projects, :upvoting_method, :reactions_up_method
    # rename_column :projects, :upvoting_limited_max, :reactions_up_limited_max
    # rename_column :projects, :downvoting_enabled, :reactions_down_enabled
    # rename_column :projects, :downvoting_method, :reactions_down_method
    # rename_column :projects, :downvoting_limited_max, :reactions_down_limited_max

    # TODO: views:
    # idea_trending_infos
    # union_posts
    # analytics_fact_posts
    # analytics_fact_participations
  end
end

# frozen_string_literal: true

class ProjectRemoveContinuousAttributes < ActiveRecord::Migration[6.1]
  def change
    remove_column :projects, :process_type, :string, default: 'timeline'
    remove_column :projects, :participation_method, :string, default: 'ideation'
    remove_column :projects, :presentation_mode, :string, default: 'card'
    remove_column :projects, :ideas_order, :string
    remove_column :projects, :input_term, :string, default: 'idea'
    remove_column :projects, :allow_anonymous_participation, :boolean, default: false
    remove_column :projects, :posting_enabled, :boolean, default: true
    remove_column :projects, :posting_method, :string, default: 'unlimited'
    remove_column :projects, :posting_limited_max, :integer, default: 1
    remove_column :projects, :commenting_enabled, :boolean, default: true
    remove_column :projects, :reacting_enabled, :boolean, default: true
    remove_column :projects, :reacting_like_method, :string, default: 'unlimited'
    remove_column :projects, :reacting_like_limited_max, :integer, default: 1
    remove_column :projects, :reacting_dislike_enabled, :boolean, default: true
    remove_column :projects, :reacting_dislike_method, :string, default: 'unlimited'
    remove_column :projects, :reacting_dislike_limited_max, :integer, default: 10
    remove_column :projects, :voting_min_total, :integer, default: 1
    remove_column :projects, :voting_max_total, :integer
    remove_column :projects, :voting_method, :string
    remove_column :projects, :voting_max_votes_per_idea, :integer
    remove_column :projects, :voting_term_singular_multiloc, :jsonb, default: {}
    remove_column :projects, :voting_term_plural_multiloc, :jsonb, default: {}
    remove_column :projects, :survey_embed_url, :string
    remove_column :projects, :survey_service, :string
    remove_column :projects, :poll_anonymous, :boolean, default: false
    remove_column :projects, :document_annotation_embed_url, :string
  end
end

# frozen_string_literal: true

class AddDeletedAtForSoftDelete < ActiveRecord::Migration[7.2]
  def change
    # All tables in the Project/Phase destroy cascade need deleted_at
    # for acts_as_paranoid soft-delete support.
    tables = %i[
      projects
      phases
      ideas
      events
      admin_publications
      custom_forms
      followers
      nav_bar_items
      projects_global_topics
      input_topics
      areas_projects
      groups_projects
      project_images
      project_files
      project_reviews
      files_projects
      jobs_trackers
      email_campaigns_campaigns
      maps_map_configs
      analysis_analyses
      webhooks_subscriptions
      idea_import_files
      baskets
      permissions
      ideas_phases
      phase_files
      polls_questions
      polls_responses
      surveys_responses
      volunteering_causes
      report_builder_reports
      comments
      internal_comments
      reactions
      spam_reports
      official_feedbacks
      idea_images
      idea_files
      baskets_ideas
      ideas_input_topics
      cosponsorships
      idea_relations
      idea_exposures
      embeddings_similarities
      authoring_assistance_responses
      wise_voice_flags
      analysis_taggings
      analysis_comments_summaries
      idea_imports
      events_attendances
      event_files
      event_images
      custom_fields
      text_images
      groups_permissions
      permissions_custom_fields
      analysis_additional_custom_fields
      analysis_tags
      analysis_background_tasks
      analysis_insights
      analysis_heatmap_cells
      email_campaigns_examples
      webhooks_deliveries
      report_builder_published_graph_data_units
      content_builder_layouts
      maps_layers
      polls_options
      volunteering_volunteers
      custom_field_options
      custom_field_matrix_statements
      custom_field_bins
    ]

    safety_assured do
      tables.each do |table_name|
        add_column table_name, :deleted_at, :datetime, null: true
        add_index table_name, :deleted_at
      end
    end
  end
end

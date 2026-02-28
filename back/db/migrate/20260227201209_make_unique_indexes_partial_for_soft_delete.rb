# frozen_string_literal: true

class MakeUniqueIndexesPartialForSoftDelete < ActiveRecord::Migration[7.2]
  def change
    # Convert unique indexes to partial unique indexes (WHERE deleted_at IS NULL)
    # so soft-deleted records don't conflict with active records.

    safety_assured do
      # projects
      remove_index :projects, name: :index_projects_on_slug
      add_index :projects, :slug, unique: true, where: 'deleted_at IS NULL', name: :index_projects_on_slug

      # ideas
      remove_index :ideas, name: :index_ideas_on_slug
      add_index :ideas, :slug, unique: true, where: 'deleted_at IS NULL', name: :index_ideas_on_slug

      # custom_forms
      remove_index :custom_forms, name: :index_custom_forms_on_participation_context
      add_index :custom_forms, %i[participation_context_id participation_context_type], unique: true, where: 'deleted_at IS NULL', name: :index_custom_forms_on_participation_context

      # followers
      remove_index :followers, name: :index_followers_followable_type_id_user_id
      add_index :followers, %i[followable_id followable_type user_id], unique: true, where: 'deleted_at IS NULL', name: :index_followers_followable_type_id_user_id

      # areas_projects
      remove_index :areas_projects, name: :index_areas_projects_on_project_id_and_area_id
      add_index :areas_projects, %i[project_id area_id], unique: true, where: 'deleted_at IS NULL', name: :index_areas_projects_on_project_id_and_area_id

      # groups_projects
      remove_index :groups_projects, name: :index_groups_projects_on_group_id_and_project_id
      add_index :groups_projects, %i[group_id project_id], unique: true, where: 'deleted_at IS NULL', name: :index_groups_projects_on_group_id_and_project_id

      # reactions
      remove_index :reactions, name: :index_reactions_on_reactable_type_and_reactable_id_and_user_id
      add_index :reactions, %i[reactable_type reactable_id user_id], unique: true, where: 'deleted_at IS NULL', name: :index_reactions_on_reactable_type_and_reactable_id_and_user_id

      # baskets_ideas
      remove_index :baskets_ideas, name: :index_baskets_ideas_on_basket_id_and_idea_id
      add_index :baskets_ideas, %i[basket_id idea_id], unique: true, where: 'deleted_at IS NULL', name: :index_baskets_ideas_on_basket_id_and_idea_id

      # ideas_phases
      remove_index :ideas_phases, name: :index_ideas_phases_on_idea_id_and_phase_id
      add_index :ideas_phases, %i[idea_id phase_id], unique: true, where: 'deleted_at IS NULL', name: :index_ideas_phases_on_idea_id_and_phase_id

      # ideas_input_topics
      remove_index :ideas_input_topics, name: :index_ideas_input_topics_on_idea_id_and_input_topic_id
      add_index :ideas_input_topics, %i[idea_id input_topic_id], unique: true, where: 'deleted_at IS NULL', name: :index_ideas_input_topics_on_idea_id_and_input_topic_id

      # idea_relations
      remove_index :idea_relations, name: :index_idea_relations_on_idea_id_and_related_idea_id
      add_index :idea_relations, %i[idea_id related_idea_id], unique: true, where: 'deleted_at IS NULL', name: :index_idea_relations_on_idea_id_and_related_idea_id

      # project_reviews
      remove_index :project_reviews, name: :index_project_reviews_on_project_id
      add_index :project_reviews, :project_id, unique: true, where: 'deleted_at IS NULL', name: :index_project_reviews_on_project_id

      # files_projects
      remove_index :files_projects, name: :index_files_projects_on_file_id
      add_index :files_projects, :file_id, unique: true, where: 'deleted_at IS NULL', name: :index_files_projects_on_file_id

      remove_index :files_projects, name: :index_files_projects_on_file_id_and_project_id
      add_index :files_projects, %i[file_id project_id], unique: true, where: 'deleted_at IS NULL', name: :index_files_projects_on_file_id_and_project_id

      # events_attendances
      remove_index :events_attendances, name: :index_events_attendances_on_attendee_id_and_event_id
      add_index :events_attendances, %i[attendee_id event_id], unique: true, where: 'deleted_at IS NULL', name: :index_events_attendances_on_attendee_id_and_event_id

      # volunteering_volunteers
      remove_index :volunteering_volunteers, name: :index_volunteering_volunteers_on_cause_id_and_user_id
      add_index :volunteering_volunteers, %i[cause_id user_id], unique: true, where: 'deleted_at IS NULL', name: :index_volunteering_volunteers_on_cause_id_and_user_id

      # report_builder_reports
      remove_index :report_builder_reports, name: :index_report_builder_reports_on_name
      add_index :report_builder_reports, :name, unique: true, where: 'deleted_at IS NULL', name: :index_report_builder_reports_on_name

      # maps_map_configs
      remove_index :maps_map_configs, name: :index_maps_map_configs_on_mappable_id
      add_index :maps_map_configs, :mappable_id, unique: true, where: 'deleted_at IS NULL', name: :index_maps_map_configs_on_mappable_id

      # custom_field_options
      remove_index :custom_field_options, name: :index_custom_field_options_on_custom_field_id_and_key
      add_index :custom_field_options, %i[custom_field_id key], unique: true, where: 'deleted_at IS NULL', name: :index_custom_field_options_on_custom_field_id_and_key

      remove_index :custom_field_options, name: :index_custom_field_options_on_field_id_and_ordering_unique
      add_index :custom_field_options, %i[custom_field_id ordering], unique: true, where: 'deleted_at IS NULL', name: :index_custom_field_options_on_field_id_and_ordering_unique

      # custom_fields
      remove_index :custom_fields, name: :index_custom_fields_on_ordering
      add_index :custom_fields, :ordering, unique: true, where: 'resource_id IS NULL AND deleted_at IS NULL', name: :index_custom_fields_on_ordering

      remove_index :custom_fields, name: :index_custom_fields_on_resource_id_and_ordering_unique
      add_index :custom_fields, %i[resource_id ordering], unique: true, where: 'deleted_at IS NULL', name: :index_custom_fields_on_resource_id_and_ordering_unique

      # analysis_taggings
      remove_index :analysis_taggings, name: :index_analysis_taggings_on_tag_id_and_input_id
      add_index :analysis_taggings, %i[tag_id input_id], unique: true, where: 'deleted_at IS NULL', name: :index_analysis_taggings_on_tag_id_and_input_id

      # analysis_tags
      remove_index :analysis_tags, name: :index_analysis_tags_on_analysis_id_and_name
      add_index :analysis_tags, %i[analysis_id name], unique: true, where: 'deleted_at IS NULL', name: :index_analysis_tags_on_analysis_id_and_name

      # content_builder_layouts
      remove_index :content_builder_layouts, name: :index_content_builder_layouts_content_buidable_type_id_code
      add_index :content_builder_layouts, %i[content_buildable_type content_buildable_id code], unique: true, where: 'deleted_at IS NULL', name: :index_content_builder_layouts_content_buidable_type_id_code

      # analysis_additional_custom_fields
      remove_index :analysis_additional_custom_fields, name: :index_analysis_analyses_custom_fields
      add_index :analysis_additional_custom_fields, %i[analysis_id custom_field_id], unique: true, where: 'deleted_at IS NULL', name: :index_analysis_analyses_custom_fields

      # analysis_heatmap_cells
      remove_index :analysis_heatmap_cells, name: :index_analysis_heatmap_cells_uniqueness
      add_index :analysis_heatmap_cells, %i[analysis_id row_id column_id unit], unique: true, where: 'deleted_at IS NULL', name: :index_analysis_heatmap_cells_uniqueness

      # permissions_custom_fields
      remove_index :permissions_custom_fields, name: :index_permission_field
      add_index :permissions_custom_fields, %i[permission_id custom_field_id], unique: true, where: 'deleted_at IS NULL', name: :index_permission_field

      # jobs_trackers
      remove_index :jobs_trackers, name: :idx_on_context_type_context_id_root_job_type_d5d424e7c3
      add_index :jobs_trackers, %i[context_type context_id root_job_type], unique: true,
        where: "root_job_type = 'Files::DescriptionGenerationJob' AND deleted_at IS NULL",
        name: :idx_on_context_type_context_id_root_job_type_d5d424e7c3

      remove_index :jobs_trackers, name: :index_jobs_trackers_on_root_job_id
      add_index :jobs_trackers, :root_job_id, unique: true, where: 'deleted_at IS NULL', name: :index_jobs_trackers_on_root_job_id
    end
  end
end

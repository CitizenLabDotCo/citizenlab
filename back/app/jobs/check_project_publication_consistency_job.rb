# frozen_string_literal: true

class CheckProjectPublicationConsistencyJob < ApplicationJob
  queue_as :default

  def perform(saved_project_id)
    # This code checks all projects for inconsistencies after a project save
    # The saved_project_id provides context for which project triggered this check
    Project.includes(:admin_publication).each do |project|
      next if project.valid?

      errors = project&.errors&.details

      # Skip a known case where we expect project to be invalid at this point
      moved_folder = project.admin_publication&.parent_id_was == project.folder_id
      assignee_error_only = errors == { default_assignee_id: [{ error: :assignee_can_not_moderate_project }] }
      next if assignee_error_only && moved_folder

      # Enhanced Sentry reporting: include project and admin_publication attributes
      extra_context = {
        errors: errors,
        project_attributes: project.attributes,
        admin_publication_attributes: project.admin_publication&.attributes
      }
      ErrorReporter.report_msg(
        "Project has admin publication inconsistencies! (id: #{project.id}) after save of project: #{saved_project_id}",
        extra: extra_context
      )
    end
  end
end

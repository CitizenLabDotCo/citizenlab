class SideFxModeratorService

  include SideFxHelper

  def after_create moderator, project, current_user
    LogActivityJob.set(wait: 5.seconds).perform_later(
      moderator, 'project_moderation_rights_given',
      current_user, Time.now.to_i,
      payload: {project_id: project.id}
      )
  end

  def after_destroy moderator, project, current_user
    remove_project_assignments(moderator, project)
    LogActivityJob.perform_later(
      moderator, 'project_moderation_rights_removed',
      current_user, Time.now.to_i
      )
  end

  private

  def remove_project_assignments moderator, project
    if project.default_assignee == moderator
      project.update(default_assignee: nil)
    end
  end
end

::SideFxIdeaService.prepend_if_ee('IdeaAssignment::Patches::SideFxModeratorService')

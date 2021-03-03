module ProjectFolders
  class SideFxModeratorService
    include SideFxHelper

    def before_create(moderator, folder, _current_user)
      folder.projects.each do |project|
        moderator.add_role('project_moderator', project_id: project.id)
      end
    end

    def before_destroy(moderator, folder, _current_user)
      folder.projects.each do |project|
        moderator.delete_role('project_moderator', project_id: project.id)
      end
    end

    def after_create(moderator, folder, current_user)
      LogActivityJob.set(wait: 5.seconds).perform_later(
        moderator,
        'project_folder_moderation_rights_given',
        current_user,
        Time.now.to_i,
        payload: { project_folder_id: folder.id }
      )
    end

    def after_destroy(moderator, folder, current_user)
      LogActivityJob.perform_later(
        moderator,
        'project_folder_moderation_rights_removed',
        current_user,
        Time.now.to_i,
        payload: { project_folder_id: folder.id }
      )
    end
  end
end

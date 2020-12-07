module ProjectFolders
  class SideFxModeratorService
    include SideFxHelper

    def before_create(moderator, folder, current_user)
      folder.projects.each do |project|
        moderator.add_role('project_moderator', project_id: project.id)
        project_mod_side_fx&.after_create(moderator, project, current_user)
      end
    end

    def before_destroy(moderator, folder, current_user)
      folder.projects.each do |project|
        moderator.delete_role('project_moderator', project_id: project.id)
        project_mod_side_fx&.after_destroy(moderator, project, current_user)
      end
    end

    def after_create(moderator, folder, current_user)
      LogActivityJob.set(wait: 5.seconds).perform_later(
        moderator,
        'project_folder_moderation_rights_given',
        current_user,
        Time.now.to_i,
        payload: { folder_id: folder.id }
      )
    end

    def after_destroy(moderator, _folder, current_user)
      LogActivityJob.perform_later(
        moderator,
        'project_moderation_rights_removed',
        current_user,
        Time.now.to_i
      )
    end

    private

    def project_mod_side_fx
      @project_mod_side_fx ||= ::SideFxModeratorService.new
    end
  end
end

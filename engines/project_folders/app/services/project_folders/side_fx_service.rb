module ProjectFolders
  class SideFxService

    include SideFxHelper

    def after_create folder, user
      LogActivityJob.perform_later(folder, 'created', user, folder.created_at.to_i)
    end

    def after_update folder, user
      LogActivityJob.perform_later(folder, 'changed', user, folder.updated_at.to_i)
    end

    def after_destroy frozen_folder, user
      remove_moderators(frozen_folder)
      serialized_folder = clean_time_attributes(frozen_folder.attributes)
      LogActivityJob.perform_later(
          encode_frozen_resource(frozen_folder), 'deleted',
          user, Time.now.to_i,
          payload: {project_folder: serialized_folder}
      )
    end

    private

    def remove_moderators(frozen_folder)
      User.project_folder_moderator(frozen_folder.id).each do |user|
        user.delete_role('project_folder_moderator', project_folder_id: frozen_folder.id)
        user.save
      end
    end
  end
end

# frozen_string_literal: true

module ProjectFolders
  class SideFxService
    include SideFxHelper

    def after_create(folder, user)
      folder.update!(description_multiloc: TextImageService.new.swap_data_images(folder, :description_multiloc))
      LogActivityJob.perform_later(folder, 'created', user, folder.created_at.to_i)
    end

    def before_update(folder, _user)
      folder.description_multiloc = TextImageService.new.swap_data_images(folder, :description_multiloc)
    end

    def after_update(folder, user)
      LogActivityJob.perform_later(folder, 'changed', user, folder.updated_at.to_i)
    end

    def after_destroy(frozen_folder, user)
      serialized_folder = clean_time_attributes(frozen_folder.attributes)
      LogActivityJob.perform_later(
        encode_frozen_resource(frozen_folder), 'deleted',
        user, Time.now.to_i,
        payload: { project_folder: serialized_folder }
      )
    end
  end
end

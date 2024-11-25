# frozen_string_literal: true

module ProjectFolders
  class SideFxProjectFolderService
    include SideFxHelper

    def after_create(folder, user)
      folder.update!(description_multiloc: TextImageService.new.swap_data_images_multiloc(folder.description_multiloc, field: :description_multiloc, imageable: folder))
      LogActivityJob.perform_later(
        folder,
        'created',
        user,
        folder.created_at.to_i,
        payload: { project_folder: clean_time_attributes(folder.attributes) }
      )
    end

    def before_update(folder, _user)
      folder.description_multiloc = TextImageService.new.swap_data_images_multiloc(folder.description_multiloc, field: :description_multiloc, imageable: folder)
    end

    def after_update(folder, user)
      change = folder.saved_changes
      payload = { project_folder: clean_time_attributes(folder.attributes) }
      payload[:change] = sanitize_change(change) if change.present?

      LogActivityJob.perform_later(folder, 'changed', user, folder.updated_at.to_i, payload: payload)
    end

    def after_destroy(frozen_folder, user)
      ContentBuilder::LayoutService.new.delete_admin_publication_id_from_homepage_layout(frozen_folder)

      serialized_folder = clean_time_attributes(frozen_folder.attributes)

      LogActivityJob.perform_later(
        encode_frozen_resource(frozen_folder), 'deleted',
        user, Time.now.to_i,
        payload: { project_folder: serialized_folder }
      )
    end
  end
end

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
      delete_admin_publication_ids_from_homepage_layout(frozen_folder)

      serialized_folder = clean_time_attributes(frozen_folder.attributes)

      LogActivityJob.perform_later(
        encode_frozen_resource(frozen_folder), 'deleted',
        user, Time.now.to_i,
        payload: { project_folder: serialized_folder }
      )
    end

    private

    def delete_admin_publication_ids_from_homepage_layout(folder)
      homepage_layout = ContentBuilder::Layout.find_by(code: 'homepage')
      return unless homepage_layout

      homepage_layout.craftjs_json = homepage_layout.craftjs_json.each_value do |node|
        next unless node['type']['resolvedName'] == 'Selection'

        node['props']['adminPublicationIds'].delete(folder.admin_publication.id)
      end

      homepage_layout.save!
    end
  end
end

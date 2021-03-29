# frozen_string_literal: true

module ProjectFolders
  module Patches
    module Frontend
      module UrlService
        def model_to_url(model_instance, options = {})
          return "#{home_url(options)}/folders/#{model_instance.slug}" if model_instance.is_a?(::ProjectFolders::Folder)

          super
        end

        def admin_project_folder_url(project_folder_id, locale: nil)
          locale ||= AppConfiguration.instance.settings('core', 'locales').first
          "#{AppConfiguration.instance.base_frontend_uri}/#{locale}/admin/projects/folders/#{project_folder_id}"
        end
      end
    end
  end
end

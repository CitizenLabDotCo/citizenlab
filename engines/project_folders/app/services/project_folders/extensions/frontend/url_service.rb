module ProjectFolders
  module Extensions
    module Frontend
      module UrlService
        def admin_project_folder_url(project_folder_id, locale: nil)
          locale ||= AppConfiguration.instance.settings('core', 'locales').first
          "#{AppConfiguration.instance.base_frontend_uri}/#{locale}/admin/projects/folders/#{project_folder_id}"
        end
      end
    end
  end
end

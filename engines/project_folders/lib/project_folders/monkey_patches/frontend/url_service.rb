module ProjectFolders
  module MonkeyPatches
    module Frontend
      module UrlService
        def admin_project_folder_url(project_folder_id, tenant: Tenant.current)
          "#{tenant.base_frontend_uri}/admin/projects/folders/#{project_folder_id}"
        end
      end
    end
  end
end

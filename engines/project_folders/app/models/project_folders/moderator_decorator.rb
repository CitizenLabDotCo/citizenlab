module ProjectFolders
  module ModeratorDecorator
    def self.prepended(base)
      base.class_eval do
        scope :project_folder_moderator, lambda { |*project_folder_ids|
          return where("roles @> '[{\"type\":\"project_moderator\"}]'") if project_folder_ids.empty?

          query = project_folder_ids.map do |id|
            JSON.generate([{ type: 'project_folder_moderator', project_folder_id: id }])
          end
          where('roles @> ?', query)
        }

        scope :not_project_folder_moderator, lambda {
          where.not("roles @> '[{\"type\":\"project_moderator\"}]'")
        }
      end
    end

    def roles_json_schema
      Rails.root.join('engines', 'project_folders', 'config', 'schemas', 'user_roles.json_schema').to_s
    end

    def highest_role
      if super_admin?                 then :super_admin
      elsif admin?                    then :admin
      elsif project_folder_moderator? then :project_folder_moderator
      elsif project_moderator?        then :project_moderator
      else                                 :user
      end
    end

    def project_folder_moderator?(project_folder_id = nil)
      roles.any? do |r|
        r['type'] == 'project_folder_moderator' &&
          (project_folder_id.nil? || r['project_folder_id'] == project_folder_id)
      end
    end

    def admin_or_folder_moderator?(project_folder_id)
      admin? || (project_folder_id && project_folder_moderator?(project_folder_id))
    end

    def active_admin_or_folder_moderator?(project_folder_id)
      active? && admin_or_folder_moderator?(project_folder_id)
    end

    def moderated_folders
      ProjectFolders::Folder.where(id: moderated_folder_ids)
    end

    def moderated_folder_ids
      roles.select { |role| role['type'] == 'project_folder_moderator' }
           .map { |role| role['project_folder_id'] }
           .compact
    end
  end
end

User.prepend(ProjectFolders::ModeratorDecorator)

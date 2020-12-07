module ProjectFolders
  module MonkeyPatches
    module SideFxProjectService
      def after_create(project, user)
        super
        return unless user.admin?

        user.add_role('project_moderator', project_id: project.id)
        user.save
      end
    end
  end
end

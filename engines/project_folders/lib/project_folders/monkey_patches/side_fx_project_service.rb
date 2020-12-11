module ProjectFolders
  module MonkeyPatches
    module SideFxProjectService
      def after_create(project, user)
        super
        return unless user.admin?

        user.add_project_moderator_role(project)
        user.save
      end
    end
  end
end

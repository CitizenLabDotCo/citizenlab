module ProjectFolders
  module MonkeyPatches
    module ProjectPolicy
      def create?
        super || (
          record&.admin_publication&.parent&.publication &&
          user.project_folder_moderator?(record.admin_publication.parent.publication)
        )
      end
    end
  end
end

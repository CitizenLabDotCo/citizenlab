module ProjectFolders::UserDecorator
  def self.prepended(base)
    base.class_eval do
      has_many_roles :project_folder_moderator,
                     through: :admin_publication_moderator,
                     class: 'ProjectFolders::Folder',
                     source: :publication
    end
  end
end

User.prepend(ProjectFolders::UserDecorator)

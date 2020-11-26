module ProjectFolders::RoledDecorator
  def self.prepended(base)
    base.has_many_roles :project_folder_moderator,
                        through: :admin_publication_moderator,
                        class: 'ProjectFolders::Folder',
                        source: :publication
  end
end

# User.prepend(ProjectFolders::RoledDecorator)

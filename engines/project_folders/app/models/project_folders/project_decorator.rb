module ProjectFolders::ProjectDecorator
  def folder
    admin_publication.parent&.publication
  end
end

Project.prepend(ProjectFolders::ProjectDecorator)

module ProjectFolders::ProjectDecorator
  def folder
    admin_publication&.parent&.publication
  end

  def folder_id=(id)
    parent_id = AdminPublication.find_by(publication_type: 'ProjectFolders::Folder', publication_id: id)&.id
    raise ActiveRecord::RecordNotFound if id.present? && parent_id.nil?

    build_admin_publication unless admin_publication
    admin_publication.assign_attributes(parent_id: parent_id)
  end

  def folder=(folder)
    self.folder_id = folder.id
  end
end

Project.prepend(ProjectFolders::ProjectDecorator)

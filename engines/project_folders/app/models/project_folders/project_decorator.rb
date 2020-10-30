module ProjectFolders::ProjectDecorator
  def self.prepended(base)

    def folder
      admin_publication.parent&.publication
    end

    def set_folder!(folder_id)
      parent = if folder_id.present?
                 AdminPublication.find_by!(publication_id: folder_id, publication_type: ProjectFolders::Folder.name)
               else
                 nil
               end
      AdminPublication.where(publication: self).first.update!(parent_id: parent&.id)
      reload
    end

  end
end

Project.prepend(ProjectFolders::ProjectDecorator)

module ProjectFolders::ProjectDecorator
  def self.prepended(base)
    base.class_eval do
      after_validation :assign_moderators_from_folder, if: :folder
      after_validation :remove_moderators_from_folder, if: :folder
    end
  end

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

  def assign_moderators_from_folder
    (folder.moderators - moderators).each do |user|
      user.add_role('project_moderator', { project_id: id })
      user.save
    end
  end

  def remove_moderators_from_folder
    (moderators - folder.moderators).each do |user|
      user.delete_role('project_moderator', { project_id: id })
      user.save
    end
  end
end

Project.prepend(ProjectFolders::ProjectDecorator)

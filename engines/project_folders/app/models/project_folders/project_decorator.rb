module ProjectFolders::ProjectDecorator
  def self.prepended(base)
    base.class_eval do
      after_validation :assign_moderators_from_folder, if: :folder
      after_validation :remove_moderators_from_folder, if: :folder
    end

    def folder
      admin_publication.parent&.publication
    end
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

# frozen_string_literal: true

module Files
  class FilesProjectPolicy < ApplicationPolicy
    def create?
      UserRoleService.new.can_moderate_project?(record.project, user) &&
        record.file.uploader_id == user.id
    end
  end
end

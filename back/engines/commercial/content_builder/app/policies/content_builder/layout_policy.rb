# frozen_string_literal: true

module ContentBuilder
  class LayoutPolicy < ApplicationPolicy
    def show?
      true
    end

    def upsert?
      moderator? && authorized_to_attach_files?
    end

    def update?
      moderator? && authorized_to_attach_files?
    end

    def destroy?
      moderator?
    end

    private

    def moderator?
      user&.active? && (record.content_buildable ? user_role_service.can_moderate?(record.content_buildable, user) : user.admin?)
    end

    def user_role_service
      @user_role_service ||= UserRoleService.new
    end

    # Checks that the user is authorized to use all files referenced in craftjs_json.
    def authorized_to_attach_files?
      file_ids = record.referenced_file_ids
      return true if file_ids.empty?

      # Ideally, we would check `policy_for(file_attachment).create?`, but that causes a
      # circular dependency since `FileAttachmentPolicy#create?` calls
      # `policy_for(attachable).update?`. As a workaround, we essentially inline the
      # relevant part of `FileAttachmentPolicy#create?` here.
      #
      # Missing files are ignored to allow saving layouts with references to deleted files.
      # This is handled gracefully in the front-end.
      ::Files::File.where(id: file_ids).all? { |file| policy_for(file).update? }
    end
  end
end

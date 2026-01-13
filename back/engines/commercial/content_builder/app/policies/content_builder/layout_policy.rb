# frozen_string_literal: true

module ContentBuilder
  class LayoutPolicy < ApplicationPolicy
    def show?
      true
    end

    def upsert?
      moderator?
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
      file_ids = FileAttachmentProcessorService.extract_file_ids(record.craftjs_json)
      return true if file_ids.empty?

      # All referenced files must exist and the user must be authorized to use them.
      files = ::Files::File.where(id: file_ids).index_by(&:id)
      file_ids.all? do |file_id|
        file = files[file_id]
        next false unless file

        # Ideally, we would check `policy_for(file_attachment).create?`, but that causes a
        # circular dependency since `FileAttachmentPolicy#create?` calls
        # `policy_for(attachable).update?`. As a workaround, we essentially inline the
        # relevant part of `FileAttachmentPolicy#create?` here.
        policy_for(file).update?
      end
    end
  end
end

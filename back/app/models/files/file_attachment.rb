# == Schema Information
#
# Table name: file_attachments
#
#  id              :uuid             not null, primary key
#  file_id         :uuid             not null
#  attachable_type :string           not null
#  attachable_id   :uuid             not null
#  position        :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_file_attachments_on_attachable           (attachable_type,attachable_id)
#  index_file_attachments_on_file_and_attachable  (file_id,attachable_type,attachable_id) UNIQUE
#  index_file_attachments_on_file_id              (file_id)
#
# Foreign Keys
#
#  fk_rails_...  (file_id => files.id)
#
module Files
  class FileAttachment < ApplicationRecord
    ATTACHABLE_TYPES = %w[
      Phase
      Project
      ProjectFolders::Folder
      Event
      Idea
      StaticPage
    ].freeze

    belongs_to :file, class_name: 'Files::File', inverse_of: :attachments
    belongs_to :attachable, polymorphic: true

    # TODO: Disabling position management on the backend for now because it would break
    #   reordering, as the frontend assumes it has full control over the ordering. This
    #   should be addressed alongside a frontend refactoring. Ticket: TAN-5126.
    # positioned on: :attachable

    validates :file_id, uniqueness: { scope: %i[attachable_type attachable_id] }
    validates :attachable_type, inclusion: { in: ATTACHABLE_TYPES }

    scope :ordered, -> { order(:position) }

    after_destroy :destroy_orphaned_file

    private

    # If this is the last attachment for the underlying file, also delete the file, which
    # is always the case currently as the application does not provide a way to attach the
    # same file to multiple resources for now.
    #
    # This is a temporary implementation that maintains the existing behavior: the user
    # expects the file to be removed from our servers if the attachment or the resource
    # it's attached to is deleted. This is of particular importance for the files attached
    # to ideas since they are typically uploaded by end users and not by admins. This will
    # be reworked in the future to be less destructive.
    def destroy_orphaned_file
      return if file.being_destroyed? || file.attachments.reload.present?

      file.destroy!
    end
  end
end

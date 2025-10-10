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
      Analysis::Analysis
      Analysis::Question
      ContentBuilder::Layout
      Event
      Idea
      Phase
      Project
      ProjectFolders::Folder
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
    validate :validate_file_belongs_to_project
    validate :validate_idea_attachment_uniqueness

    scope :ordered, -> { order(:position) }

    after_destroy :destroy_orphaned_idea_file

    private

    # Files uploaded by end users (currently, files attached to ideas) are automatically
    # deleted if their last attachment is removed (in theory, there should only be one
    # such attachment). This is to maintain the expected behavior that when an idea is
    # deleted or a file is detached from an idea, the file is also removed from our
    # storage.
    def destroy_orphaned_idea_file
      return unless attachable_type == 'Idea'
      return if file.being_destroyed? || file.attachments.reload.present?

      file.destroy!
    end

    # Prevent files from being attached to resources in other projects.
    def validate_file_belongs_to_project
      return unless file.present? && attachable.present?
      return unless attachable_type.in?(%w[
        Project
        Phase
        Event
        Idea
        Analysis::Analysis
        Analysis::Question
      ])

      # Using `files_projects` instead of `projects` because `projects` does not include
      # projects whose corresponding `files_project` records have not yet been saved.
      project_ids = file.files_projects.map(&:project_id)

      # This will fail for Analysis::Analysis and Analysis::Question if the analysis is
      # not associated with a project. However, we currently do not support that scenario,
      # so it should not occur in practice.
      if project_ids.exclude?(attachable.source_project.id)
        errors.add(:file, :does_not_belong_to_project, message: 'does not belong to the project')
      end
    end

    # Prevent reuse of idea files. If a file is attached to an idea, it cannot be attached
    # to any other resource.
    def validate_idea_attachment_uniqueness
      return unless file

      # Other attachments for the *same file*.
      other_attachments = file.attachments.where.not(id: id)

      if other_attachments.exists?(attachable_type: 'Idea')
        errors.add(
          :file,
          :already_attached,
          message: 'cannot be attached to other resources because it is already attached to an idea'
        )
      elsif attachable_type == 'Idea' && other_attachments.exists?
        errors.add(
          :file,
          :already_attached,
          message: 'cannot be attached to an idea because it is already attached to another resource'
        )
      end
    end
  end
end

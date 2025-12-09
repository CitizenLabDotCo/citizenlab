# frozen_string_literal: true

module Files
  module FileAttachable
    extend ActiveSupport::Concern

    included do
      has_many :file_attachments, -> { ordered },
        as: :attachable,
        inverse_of: :attachable,
        class_name: 'Files::FileAttachment',
        dependent: :destroy

      has_many :attached_files, through: :file_attachments, source: :file, class_name: 'Files::File'
    end

    # The project to which the attachable resource belongs. This is used to
    # validate that files being attached to the resource also belong to the same
    # project. We implement it explicitly so each model can override how to
    # derive which project it belongs to. (as is the case for at least
    # Analysis::Analysis)
    def source_project
      project
    end
  end
end

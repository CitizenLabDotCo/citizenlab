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
  end
end

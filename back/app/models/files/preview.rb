module Files
  # A Files::Preview instance is a PDF version of a Files::File, that is
  # generated internally for previewing purposes.
  class Preview < ApplicationRecord
    self.table_name = 'files_previews'

    belongs_to :file, class_name: 'Files::File', inverse_of: :preview

    STATUSES = %w[pending completed failed].freeze

    attribute :status, :string, default: 'pending'
    validates :status, presence: true, inclusion: { in: STATUSES }
    validates :content, presence: true

    mount_uploader :content, PreviewUploader
  end
end

# == Schema Information
#
# Table name: file_attachments
#
#  id              :uuid             not null, primary key
#  file_id         :uuid             not null
#  attachable_type :string           not null
#  attachable_id   :uuid             not null
#  position        :integer          not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_file_attachments_on_attachable               (attachable_type,attachable_id)
#  index_file_attachments_on_attachable_and_position  (attachable_type,attachable_id,position) UNIQUE
#  index_file_attachments_on_file_and_attachable      (file_id,attachable_type,attachable_id) UNIQUE
#  index_file_attachments_on_file_id                  (file_id)
#
# Foreign Keys
#
#  fk_rails_...  (file_id => files.id)
#
module Files
  class FileAttachment < ApplicationRecord
    ATTACHABLE_TYPES = %w[Phase Project Event Idea StaticPage].freeze

    belongs_to :file, class_name: 'Files::File', inverse_of: :attachments
    belongs_to :attachable, polymorphic: true

    positioned on: :attachable

    validates :file_id, uniqueness: { scope: %i[attachable_type attachable_id] }
    validates :attachable_type, inclusion: { in: ATTACHABLE_TYPES }

    scope :ordered, -> { order(:position) }
  end
end

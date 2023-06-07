# frozen_string_literal: true

# == Schema Information
#
# Table name: event_files
#
#  id         :uuid             not null, primary key
#  event_id   :uuid
#  file       :string
#  ordering   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  name       :string
#
# Indexes
#
#  index_event_files_on_event_id  (event_id)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
class EventFile < ApplicationRecord
  mount_base64_file_uploader :file, EventFileUploader
  belongs_to :event

  validates :event, :name, presence: true
  validates :file, presence: true, unless: proc { Current.loading_tenant_template }
end

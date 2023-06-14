# frozen_string_literal: true

# == Schema Information
#
# Table name: phase_files
#
#  id         :uuid             not null, primary key
#  phase_id   :uuid
#  file       :string
#  ordering   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  name       :string
#
# Indexes
#
#  index_phase_files_on_phase_id  (phase_id)
#
# Foreign Keys
#
#  fk_rails_...  (phase_id => phases.id)
#
class PhaseFile < ApplicationRecord
  mount_base64_file_uploader :file, PhaseFileUploader
  belongs_to :phase

  validates :phase, :name, presence: true
  validates :file, presence: true, unless: proc { Current.loading_tenant_template }
end

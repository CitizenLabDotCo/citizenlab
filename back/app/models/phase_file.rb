# frozen_string_literal: true

# == Schema Information
#
# Table name: phase_files
#
#  id                                                                                     :uuid             not null, primary key
#  phase_id                                                                               :uuid
#  file                                                                                   :string
#  ordering                                                                               :integer
#  created_at                                                                             :datetime         not null
#  updated_at                                                                             :datetime         not null
#  name                                                                                   :string
#  migrated_file_id(References the Files::File record after migration to new file system) :uuid
#  migration_skipped_reason                                                               :string
#
# Indexes
#
#  index_phase_files_on_migrated_file_id  (migrated_file_id)
#  index_phase_files_on_phase_id          (phase_id)
#
# Foreign Keys
#
#  fk_rails_...  (migrated_file_id => files.id)
#
class PhaseFile < ApplicationRecord
  include FileMigratable

  mount_base64_file_uploader :file, PhaseFileUploader
  belongs_to :phase

  validates :phase, :name, presence: true
  validates :file, presence: true, unless: proc { Current.loading_tenant_template }
end

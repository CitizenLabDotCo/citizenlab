# == Schema Information
#
# Table name: invites_imports
#
#  id           :uuid             not null, primary key
#  job_type     :string
#  result       :jsonb
#  completed_at :datetime
#  importer_id  :uuid
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_invites_imports_on_importer_id  (importer_id)
#
# Foreign Keys
#
#  fk_rails_...  (importer_id => users.id)
#
class InvitesImport < ApplicationRecord
  JOB_TYPES = %w[count_new_seats bulk_create_xlsx].freeze

  belongs_to :importer, class_name: 'User', optional: true

  validates :job_type, inclusion: { in: JOB_TYPES }
end

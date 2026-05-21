# frozen_string_literal: true

# == Schema Information
#
# Table name: phase_methods
#
#  id             :uuid             not null, primary key
#  phase_id       :uuid             not null
#  method_type    :string           not null
#  start_at       :datetime
#  end_at         :datetime
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_phase_methods_on_phase_id               (phase_id)
#  index_phase_methods_on_phase_id_and_method_type  (phase_id, method_type)
#
# Foreign Keys
#
#  fk_rails_...  (phase_id => phases.id)
#

# Named PhaseMethod (not ParticipationMethod) to avoid colliding with the
# strategy module ParticipationMethod in back/lib/participation_method/base.rb.
class PhaseMethod < ApplicationRecord
  self.table_name = 'phase_methods'

  belongs_to :phase
  has_many :ideas, dependent: :nullify, foreign_key: :phase_method_id

  validates :method_type, presence: true, inclusion: { in: Phase::PARTICIPATION_METHODS }

  scope :active, ->(time = Time.current) {
    where('(start_at IS NULL OR start_at <= ?) AND (end_at IS NULL OR end_at >= ?)', time, time)
  }
  scope :by_type, ->(type) { where(method_type: type) }
end

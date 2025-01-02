# frozen_string_literal: true

# == Schema Information
#
# Table name: cosponsors_initiatives
#
#  id            :uuid             not null, primary key
#  status        :string           default("pending"), not null
#  user_id       :uuid             not null
#  initiative_id :uuid             not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_cosponsors_initiatives_on_initiative_id  (initiative_id)
#  index_cosponsors_initiatives_on_user_id        (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (initiative_id => initiatives.id)
#  fk_rails_...  (user_id => users.id)
#
class CosponsorsInitiative < ApplicationRecord
  STATUSES = %w[pending accepted].freeze

  belongs_to :user
  belongs_to :initiative

  validates :user, :initiative, presence: true
  validates :status, inclusion: { in: STATUSES }
end

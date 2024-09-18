# frozen_string_literal: true

# == Schema Information
#
# Table name: cosponsorships
#
#  id         :uuid             not null, primary key
#  status     :string           default("pending"), not null
#  user_id    :uuid             not null
#  idea_id    :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_cosponsorships_on_idea_id  (idea_id)
#  index_cosponsorships_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (user_id => users.id)
#
class Cosponsorship < ApplicationRecord
  STATUSES = %w[pending accepted].freeze

  belongs_to :user
  belongs_to :idea

  has_many :notifications, dependent: :nullify

  validates :user, :idea, presence: true
  validates :status, inclusion: { in: STATUSES }
end

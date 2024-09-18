# frozen_string_literal: true

# == Schema Information
#
# Table name: cosponsors_ideas
#
#  cosponsor_id :uuid
#  idea_id      :uuid
#
# Indexes
#
#  index_cosponsors_ideas_on_cosponsor_id  (cosponsor_id)
#  index_cosponsors_ideas_on_idea_id       (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (cosponsor_id => users.id)
#  fk_rails_...  (idea_id => ideas.id)
#
class Cosponsorship < ApplicationRecord
  STATUSES = %w[pending accepted].freeze

  belongs_to :user
  belongs_to :idea

  has_many :notifications, dependent: :nullify

  validates :user, :idea, presence: true
  validates :status, inclusion: { in: STATUSES }
end

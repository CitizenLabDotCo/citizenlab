# frozen_string_literal: true

class NativeSurveys::Response < ApplicationRecord
  belongs_to :survey
  belongs_to :user
  has_many :answers, dependent: :destroy

  validates :survey, :user, presence: true
  validates :survey_id, uniqueness: { scope: :user_id }

  scope :submitted, -> { where.not(submitted_at: nil) }

  def submitted?
    !!submitted_at
  end
end

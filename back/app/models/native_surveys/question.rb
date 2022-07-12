# frozen_string_literal: true

class NativeSurveys::Question < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:survey_id]

  belongs_to :survey
  has_many :answer_options, dependent: :destroy
  # Surveys should not be edited when people have already submitted their responses.
  has_many :answers, dependent: :destroy

  validates :survey, presence: true
  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :required, inclusion: { in: [true, false] }

  before_validation :set_default_enabled

  private

  def set_default_enabled
    self.enabled = true if enabled.nil?
  end
end

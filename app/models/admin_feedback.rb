class AdminFeedback < ApplicationRecord
  belongs_to :user
  belongs_to :idea
  # has_many :notifications, foreign_key: :admin_feedback_id, dependent: :nullify
  
  # counter_culture :idea

  validates :body_multiloc, presence: true, multiloc: {presence: true}
  validates :author_multiloc, presence: true, multiloc: {presence: true}

  before_validation :sanitize_body_multiloc


  def project
    self.idea&.project
  end


  private

  def sanitize_body_multiloc
    self.body_multiloc = SanitizationService.new.sanitize_multiloc(
      self.body_multiloc,
      %i{mention}
    )
  end
end

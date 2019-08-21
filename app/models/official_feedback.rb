class OfficialFeedback < ApplicationRecord
  belongs_to :post, polymorphic: true
  counter_culture :post

  belongs_to :user, optional: true
  has_many :notifications, foreign_key: :official_feedback_id, dependent: :nullify

  validates :body_multiloc, presence: true, multiloc: {presence: true}
  validates :author_multiloc, presence: true, multiloc: {presence: true}

  before_validation :sanitize_body_multiloc


  private

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      self.body_multiloc,
      %i{mention}
    )
    self.body_multiloc = service.remove_empty_paragraphs_multiloc(self.body_multiloc)
    self.body_multiloc = service.linkify_multiloc(self.body_multiloc)
  end
end

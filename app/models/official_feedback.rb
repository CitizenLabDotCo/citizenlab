class OfficialFeedback < ApplicationRecord
  belongs_to :vettable, polymorphic: true  # After https://english.stackexchange.com/a/421858/350478
  counter_culture :vettable
  
  belongs_to :user
  has_many :notifications, foreign_key: :official_feedback_id, dependent: :nullify

  validates :body_multiloc, presence: true, multiloc: {presence: true}
  validates :author_multiloc, presence: true, multiloc: {presence: true}


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

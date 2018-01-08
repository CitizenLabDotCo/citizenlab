class Phase < ApplicationRecord
  belongs_to :project

  PARTICIPATION_METHODS = %w(information ideation)

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :start_at, :end_at, presence: true
  validate :validate_start_at_before_end_at
  validates :participation_method, presence: true, inclusion: {in: PARTICIPATION_METHODS}

  before_validation :sanitize_description_multiloc
  before_validation :set_participation_method, on: :create


  def sanitize_description_multiloc
    self.description_multiloc = self.description_multiloc.map do |locale, description|
      [locale, Rails::Html::WhiteListSanitizer.new.sanitize(description, tags: %w(p b u i em strong a ul li ol), attributes: %w(href type style))]
    end.to_h
  end

  def validate_start_at_before_end_at
    if start_at.present? && end_at.present? && start_at > end_at
      errors.add(:start_at, :after_end_at, message: 'is after end_at')
    end
  end

  def set_participation_method
    self.participation_method ||= 'ideation'
  end
end

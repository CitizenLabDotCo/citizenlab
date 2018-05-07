class Phase < ApplicationRecord
  include ParticipationContext

  belongs_to :project

  has_many :ideas_phases, dependent: :destroy
  has_many :ideas, through: :ideas_phases
  has_many :votes, through: :ideas

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :start_at, :end_at, presence: true
  validate :validate_start_at_before_end_at
  validate :validate_belongs_to_timeline_project

  before_validation :sanitize_description_multiloc
  before_validation :strip_title


  private

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

  def validate_belongs_to_timeline_project
    if project.present? && project.process_type != 'timeline'
      errors.add(:project, :is_not_timeline_project, message: 'is not a timeline project')
    end
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end
end

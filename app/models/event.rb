class Event < ApplicationRecord
  belongs_to :project
  has_many :event_files, -> { order(:ordering) }, dependent: :destroy

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :location_multiloc, multiloc: {presence: false}
  validate :validate_start_at_before_end_at

  before_validation :sanitize_description_multiloc
  before_validation :strip_title


  private
  
  def sanitize_description_multiloc
    self.description_multiloc = SanitizationService.new.sanitize_multiloc(
      self.description_multiloc,
      %i{title alignment list decoration link image video}
    )
  end

  def validate_start_at_before_end_at
    if start_at.present? && end_at.present? && start_at > end_at
      errors.add(:start_at, :after_end_at, message: 'is after end_at')
    end
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end
end

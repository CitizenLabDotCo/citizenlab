class Phase < ApplicationRecord
  include ParticipationContext

  belongs_to :project

  has_many :ideas_phases, dependent: :destroy
  has_many :ideas, through: :ideas_phases
  has_many :votes, through: :ideas
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  has_many :phase_files, -> { order(:ordering) }, dependent: :destroy
  before_destroy :remove_notifications
  has_many :notifications, foreign_key: :phase_id, dependent: :nullify

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :start_at, :end_at, presence: true
  validate :validate_start_at_before_end_at
  validate :validate_belongs_to_timeline_project
  validate :validate_no_other_overlapping_phases
  validate :validate_no_other_budgeting_phases

  before_validation :sanitize_description_multiloc
  before_validation :strip_title

  private

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      self.description_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags(self.description_multiloc)
    self.description_multiloc = service.linkify_multiloc(self.description_multiloc)
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

  def validate_no_other_overlapping_phases
    ts = TimelineService.new
    ts.other_project_phases(self).each do |other_phase|
      if start_at.present? && end_at.present? && ts.overlaps?(self, other_phase)
        errors.add(:base, :has_other_overlapping_phases, message: 'has other phases which overlap in start and end date')
      end
    end
  end

  def validate_no_other_budgeting_phases
    if budgeting? && project.phases.where.not(id: id).select(&:budgeting?).present?
      errors.add(
        :base, :has_other_budgeting_phases,
        message: 'has other budgeting phases'
        )
    end
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

  def remove_notifications
    notifications.each do |notification|
      if !notification.update phase_id: nil
        notification.destroy!
      end
    end
  end

end

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
  has_many :notifications, dependent: :nullify

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
  validates :start_at, :end_at, presence: true
  validate :validate_start_at_before_end_at
  validate :validate_belongs_to_timeline_project
  validate :validate_no_other_overlapping_phases
  validate :validate_no_other_budgeting_phases

  before_validation :sanitize_description_multiloc
  before_validation :strip_title

  scope :published_and_starting_on, lambda { |date|
    joined = includes(project: { admin_publication: :parent })
    joined.where(
      projects: {
        admin_publications: {
          publication_status: 'published',
          parents_admin_publications: { publication_status: 'published' }
        }
      }
    ).or(
      joined.where(
        projects: {
          admin_publications: {
            publication_status: 'published',
            parent_id: nil
          }
        }
      )
    ).where(start_at: date)
  }

  def ends_before?(date)
    end_at.iso8601 < date.to_date.iso8601
  end

  private

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      description_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags(description_multiloc)
    self.description_multiloc = service.linkify_multiloc(description_multiloc)
  end

  def validate_start_at_before_end_at
    return unless start_at.present? && end_at.present? && start_at > end_at

    errors.add(:start_at, :after_end_at, message: 'is after end_at')
  end

  def validate_belongs_to_timeline_project
    return unless project.present? && project.process_type != 'timeline'

    errors.add(:project, :is_not_timeline_project, message: 'is not a timeline project')
  end

  def validate_no_other_overlapping_phases
    ts = TimelineService.new
    ts.other_project_phases(self).each do |other_phase|
      next unless start_at.present? && end_at.present? && ts.overlaps?(self, other_phase)

      errors.add(:base, :has_other_overlapping_phases,
                 message: 'has other phases which overlap in start and end date')
    end
  end

  def validate_no_other_budgeting_phases
    return unless budgeting? && project.phases.where.not(id: id).select(&:budgeting?).present?

    errors.add(
      :base, :has_other_budgeting_phases,
      message: 'has other budgeting phases'
    )
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def remove_notifications
    notifications.each do |notification|
      notification.destroy! unless notification.update phase_id: nil
    end
  end
end

# == Schema Information
#
# Table name: events
#
#  id                   :uuid             not null, primary key
#  project_id           :uuid
#  title_multiloc       :jsonb
#  description_multiloc :jsonb
#  location_multiloc    :jsonb
#  start_at             :datetime
#  end_at               :datetime
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  attendances_count    :integer          default(0), not null
#
# Indexes
#
#  index_events_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#
class Event < ApplicationRecord
  belongs_to :project
  has_many :event_files, -> { order(:ordering) }, dependent: :destroy
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  has_many :attendances, dependent: :destroy

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :location_multiloc, multiloc: {presence: false}
  validate :validate_start_at_before_end_at

  before_validation :sanitize_description_multiloc
  before_validation :strip_title

  scope :with_project_publication_statuses, (Proc.new do |publication_statuses|
    joins(project: [:admin_publication])
      .where(projects: {admin_publications: {publication_status: publication_statuses}})
  end)

  private

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      self.description_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.description_multiloc = service.linkify_multiloc(self.description_multiloc)
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags(self.description_multiloc)
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

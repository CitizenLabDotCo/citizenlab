# frozen_string_literal: true

# == Schema Information
#
# Table name: events
#
#  id                     :uuid             not null, primary key
#  project_id             :uuid
#  title_multiloc         :jsonb
#  description_multiloc   :jsonb
#  location_multiloc      :jsonb
#  start_at               :datetime
#  end_at                 :datetime
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  location_point         :geography        point, 4326
#  address_1              :string
#  attendees_count        :integer          default(0), not null
#  address_2_multiloc     :jsonb            not null
#  using_url              :string
#  attend_button_multiloc :jsonb            not null
#  online_link            :string
#
# Indexes
#
#  index_events_on_location_point  (location_point) USING gist
#  index_events_on_project_id      (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#
class Event < ApplicationRecord
  include GeoJsonHelpers

  belongs_to :project
  has_many :attendances, class_name: 'Events::Attendance', dependent: :destroy
  has_many :attendees, through: :attendances
  has_many :event_files, -> { order(:ordering) }, dependent: :destroy
  has_many :text_images, as: :imageable, dependent: :destroy
  has_many :event_images, -> { order(:ordering) }, dependent: :destroy, inverse_of: :event
  accepts_nested_attributes_for :text_images, :event_images

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }
  validates :location_multiloc, multiloc: { presence: false }
  validates :online_link, url: true, allow_blank: true
  validates :address_2_multiloc, multiloc: { presence: false }
  validates :attend_button_multiloc, multiloc: { presence: false }
  validates :using_url, url: true, allow_blank: true
  validate :validate_start_at_before_end_at

  before_validation :sanitize_description_multiloc
  before_validation :strip_title

  scope :with_project_publication_statuses, (proc do |publication_statuses|
    joins(project: [:admin_publication])
      .where(projects: { admin_publications: { publication_status: publication_statuses } })
  end)

  private

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      description_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.description_multiloc = service.linkify_multiloc description_multiloc
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags description_multiloc
  end

  def validate_start_at_before_end_at
    return unless start_at.present? && end_at.present? && start_at > end_at

    errors.add(:start_at, :after_end_at, message: 'is after end_at')
  end

  def strip_title
    return unless title_multiloc&.any?

    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end
end

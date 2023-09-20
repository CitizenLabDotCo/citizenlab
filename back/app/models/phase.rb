# frozen_string_literal: true

# == Schema Information
#
# Table name: phases
#
#  id                            :uuid             not null, primary key
#  project_id                    :uuid
#  title_multiloc                :jsonb
#  description_multiloc          :jsonb
#  start_at                      :date
#  end_at                        :date
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#  participation_method          :string           default("ideation"), not null
#  posting_enabled               :boolean          default(TRUE)
#  commenting_enabled            :boolean          default(TRUE)
#  reacting_enabled              :boolean          default(TRUE), not null
#  reacting_like_method          :string           default("unlimited"), not null
#  reacting_like_limited_max     :integer          default(10)
#  survey_embed_url              :string
#  survey_service                :string
#  presentation_mode             :string           default("card")
#  voting_max_total              :integer
#  poll_anonymous                :boolean          default(FALSE), not null
#  reacting_dislike_enabled      :boolean          default(TRUE), not null
#  ideas_count                   :integer          default(0), not null
#  ideas_order                   :string
#  input_term                    :string           default("idea")
#  voting_min_total              :integer          default(0)
#  reacting_dislike_method       :string           default("unlimited"), not null
#  reacting_dislike_limited_max  :integer          default(10)
#  posting_method                :string           default("unlimited"), not null
#  posting_limited_max           :integer          default(1)
#  document_annotation_embed_url :string
#  allow_anonymous_participation :boolean          default(FALSE), not null
#  campaigns_settings            :jsonb
#  voting_method                 :string
#  voting_max_votes_per_idea     :integer
#  voting_term_singular_multiloc :jsonb
#  voting_term_plural_multiloc   :jsonb
#  baskets_count                 :integer          default(0), not null
#  votes_count                   :integer          default(0), not null
#
# Indexes
#
#  index_phases_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#
class Phase < ApplicationRecord
  include ParticipationContext

  belongs_to :project

  has_many :ideas_phases, dependent: :destroy
  has_many :ideas, through: :ideas_phases
  has_many :reactions, through: :ideas
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  has_many :phase_files, -> { order(:ordering) }, dependent: :destroy

  before_validation :sanitize_description_multiloc
  before_validation :strip_title
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }
  validates :start_at, :end_at, presence: true
  validate :validate_start_at_before_end_at
  validate :validate_belongs_to_timeline_project
  validate :validate_no_other_overlapping_phases

  scope :starting_on, lambda { |date|
    where(start_at: date)
  }

  scope :published, lambda {
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
    )
  }

  def ends_before?(date)
    end_at.iso8601 < date.to_date.iso8601
  end

  def permission_scope
    self
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

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update phase: nil
        notification.destroy!
      end
    end
  end
end

Phase.include(Analysis::Patches::Phase)

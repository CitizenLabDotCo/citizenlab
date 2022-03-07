# frozen_string_literal: true

# == Schema Information
#
# Table name: projects
#
#  id                           :uuid             not null, primary key
#  title_multiloc               :jsonb
#  description_multiloc         :jsonb
#  slug                         :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  header_bg                    :string
#  ideas_count                  :integer          default(0), not null
#  visible_to                   :string           default("public"), not null
#  description_preview_multiloc :jsonb
#  presentation_mode            :string           default("card")
#  participation_method         :string           default("ideation")
#  posting_enabled              :boolean          default(TRUE)
#  commenting_enabled           :boolean          default(TRUE)
#  voting_enabled               :boolean          default(TRUE), not null
#  upvoting_method              :string           default("unlimited"), not null
#  upvoting_limited_max         :integer          default(10)
#  process_type                 :string           default("timeline"), not null
#  internal_role                :string
#  survey_embed_url             :string
#  survey_service               :string
#  max_budget                   :integer
#  comments_count               :integer          default(0), not null
#  default_assignee_id          :uuid
#  poll_anonymous               :boolean          default(FALSE), not null
#  custom_form_id               :uuid
#  downvoting_enabled           :boolean          default(TRUE), not null
#  ideas_order                  :string
#  input_term                   :string           default("idea")
#  min_budget                   :integer          default(0)
#  downvoting_method            :string           default("unlimited"), not null
#  downvoting_limited_max       :integer          default(10)
#
# Indexes
#
#  index_projects_on_custom_form_id  (custom_form_id)
#  index_projects_on_slug            (slug) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (default_assignee_id => users.id)
#
class Project < ApplicationRecord
  include ParticipationContext
  include PgSearch::Model

  mount_base64_uploader :header_bg, ProjectHeaderBgUploader

  DESCRIPTION_PREVIEW_JSON_SCHEMA = ERB.new(File.read(Rails.root.join('config', 'schemas', 'project_description_preview.json_schema.erb'))).result(binding)

  has_many :ideas, dependent: :destroy
  has_many :votes, through: :ideas

  has_many :projects_topics, dependent: :destroy
  has_many :topics, through: :projects_topics
  has_many :projects_allowed_input_topics, dependent: :destroy
  has_many :allowed_input_topics, through: :projects_allowed_input_topics, source: :topic
  has_many :areas_projects, dependent: :destroy
  has_many :areas, through: :areas_projects
  has_many :groups_projects, dependent: :destroy
  has_many :groups, through: :groups_projects

  has_many :phases, -> { order(:start_at) }, dependent: :destroy
  has_many :events, -> { order(:start_at) }, dependent: :destroy
  has_many :project_images, -> { order(:ordering) }, dependent: :destroy
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  has_many :project_files, -> { order(:ordering) }, dependent: :destroy

  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  belongs_to :custom_form, optional: true, dependent: :destroy

  has_one :admin_publication, as: :publication, dependent: :destroy
  accepts_nested_attributes_for :admin_publication, update_only: true

  PROCESS_TYPES = %w[timeline continuous].freeze
  INTERNAL_ROLES = %w[open_idea_box].freeze

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
  validates :description_preview_multiloc, multiloc: { presence: false }
  validates :slug, presence: true, uniqueness: true
  validates :description_preview_multiloc, json: {
    schema: DESCRIPTION_PREVIEW_JSON_SCHEMA,
    message: ->(errors) { errors.map { |e| { fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message] } } },
    options: {
      errors_as_objects: true
    }
  }
  validates :process_type, presence: true, inclusion: { in: PROCESS_TYPES }
  validates :internal_role, inclusion: { in: INTERNAL_ROLES, allow_nil: true }
  validate :admin_publication_must_exist

  before_validation :set_process_type, on: :create
  before_validation :generate_slug, on: :create
  before_validation :sanitize_description_multiloc, if: :description_multiloc
  before_validation :strip_title
  before_validation :set_admin_publication

  pg_search_scope :search_by_all,
                  against: %i[title_multiloc description_multiloc description_preview_multiloc],
                  using: { tsearch: { prefix: true } }

  scope :with_all_areas, (proc do |area_ids|
    uniq_area_ids = area_ids.uniq
    subquery = Project.unscoped.all
      .joins(:areas)
      .where(areas: { id: uniq_area_ids })
      .group(:id)
      .having('COUNT(*) = ?', uniq_area_ids.size)

    where(id: subquery)
  end)

  scope :with_some_areas, (proc do |area_ids|
    with_dups = joins(:areas_projects).where(areas_projects: { area_id: area_ids })
    where(id: with_dups)
  end)

  scope :with_some_topics, (proc do |topic_ids|
    joins(:projects_topics).where(projects_topics: { topic_id: topic_ids }).distinct
  end)

  scope :is_participation_context, lambda {
    where.not(process_type: 'timeline')
  }

  scope :ordered, lambda {
    includes(:admin_publication).order('admin_publications.ordering')
  }

  scope :not_draft, lambda {
    includes(:admin_publication).where.not(admin_publications: { publication_status: 'draft' })
  }

  scope :publicly_visible, lambda {
    where(visible_to: 'public')
  }

  scope :user_groups_visible, lambda { |user|
    user_groups = Group.joins(:projects).where(projects: self).with_user(user)
    project_ids = GroupsProject.where(projects: self).where(groups: user_groups).select(:project_id).distinct
    where(id: project_ids)
  }

  def continuous?
    process_type == 'continuous'
  end

  def timeline?
    process_type == 'timeline'
  end

  def project
    self
  end

  def permission_scope
    return TimelineService.new.current_phase(self) if timeline?

    self
  end

  def allocated_budget
    Idea.from(ideas.select('budget * baskets_count as allocated_budget')).sum(:allocated_budget)
  end

  def set_default_topics!
    self.allowed_input_topics = Topic.defaults.order(:ordering).reverse
    save!
  end

  private

  def admin_publication_must_exist
    # Built-in presence validation does not work.
    # Admin publication must always be present
    # once the project was created.
    if id.present? && admin_publication&.id.blank?
      errors.add(:admin_publication_id, :blank, message: "Admin publication can't be blank")
    end
  end

  def generate_slug
    slug_service = SlugService.new
    self.slug ||= slug_service.generate_slug self, title_multiloc.values.first
  end

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      description_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags(description_multiloc)
    self.description_multiloc = service.linkify_multiloc(description_multiloc)
  end

  def set_process_type
    self.process_type ||= 'timeline'
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def set_admin_publication
    self.admin_publication_attributes = {} unless admin_publication
  end

  def remove_notifications
    notifications.each do |notification|
      notification.destroy! unless notification.update(project: nil)
    end
  end
end

Project.include(ProjectPermissions::Patches::Project)

Project.include_if_ee('CustomMaps::Extensions::Project')
Project.include_if_ee('IdeaAssignment::Extensions::Project')
Project.include_if_ee('Insights::Patches::Project')
Project.prepend_if_ee('ProjectFolders::Patches::Project')
Project.include_if_ee('ProjectManagement::Patches::Project')

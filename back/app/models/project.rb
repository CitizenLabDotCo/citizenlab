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
#  internal_role                :string
#  comments_count               :integer          default(0), not null
#  default_assignee_id          :uuid
#  include_all_areas            :boolean          default(FALSE), not null
#  baskets_count                :integer          default(0), not null
#  votes_count                  :integer          default(0), not null
#  followers_count              :integer          default(0), not null
#  preview_token                :string           not null
#  header_bg_alt_text_multiloc  :jsonb
#  hidden                       :boolean          default(FALSE), not null
#
# Indexes
#
#  index_projects_on_slug  (slug) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (default_assignee_id => users.id)
#
class Project < ApplicationRecord
  include PgSearch::Model

  attribute :preview_token, :string, default: -> { generate_preview_token }

  VISIBLE_TOS = %w[public groups admins].freeze

  slug from: proc { |project| project.title_multiloc&.values&.find(&:present?) }

  mount_base64_uploader :header_bg, ProjectHeaderBgUploader

  has_one :custom_form, as: :participation_context, dependent: :destroy # ideation & voting phases only

  has_many :ideas, dependent: :destroy
  has_many :reactions, through: :ideas

  has_many :projects_topics, dependent: :destroy
  has_many :topics, -> { order(:ordering) }, through: :projects_topics
  has_many :projects_allowed_input_topics, dependent: :destroy
  has_many :allowed_input_topics, through: :projects_allowed_input_topics, source: :topic
  has_many :areas_projects, dependent: :destroy
  has_many :areas, through: :areas_projects
  has_many :groups_projects, dependent: :destroy
  has_many :groups, through: :groups_projects

  has_many :phases, -> { order(:start_at) }, dependent: :destroy
  has_many :events, -> { order(:start_at) }, dependent: :destroy
  # project_images should always store one record, but in practice it's different (maybe because of a bug)
  # https://citizenlabco.slack.com/archives/C015M14HYSF/p1674228018666059
  has_many :project_images, -> { order(:ordering) }, dependent: :destroy
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  has_many :project_files, -> { order(:ordering) }, dependent: :destroy
  has_many :followers, as: :followable, dependent: :destroy
  has_many :impact_tracking_pageviews, class_name: 'ImpactTracking::Pageview', dependent: :nullify
  has_many :jobs_trackers, class_name: 'Jobs::Tracker', dependent: :destroy

  before_validation :sanitize_description_multiloc, if: :description_multiloc
  before_validation :set_admin_publication, unless: proc { Current.loading_tenant_template }
  before_validation :set_visible_to, on: :create
  before_validation :strip_title
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  has_one :nav_bar_item, dependent: :destroy
  has_one :review, class_name: 'ProjectReview', dependent: :destroy

  has_one :admin_publication, as: :publication, dependent: :destroy
  accepts_nested_attributes_for :admin_publication, update_only: true

  after_destroy :remove_moderators

  attr_accessor :folder_changed, :folder_was

  after_save :reassign_moderators, if: :folder_changed?
  after_commit :clear_folder_changes, if: :folder_changed?

  INTERNAL_ROLES = %w[open_idea_box community_monitor].freeze

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }
  validates :description_preview_multiloc, multiloc: { presence: false }
  validates :visible_to, presence: true, inclusion: { in: VISIBLE_TOS }
  validates :internal_role, inclusion: { in: INTERNAL_ROLES, allow_nil: true }
  validate :admin_publication_must_exist, unless: proc { Current.loading_tenant_template } # TODO: This should always be validated!

  scope :not_hidden, -> { where(hidden: false) }

  pg_search_scope :search_by_all,
    against: %i[title_multiloc description_multiloc description_preview_multiloc slug],
    using: { tsearch: { prefix: true } }

  pg_search_scope :search_by_title,
    against: :title_multiloc,
    using: { tsearch: { prefix: true } }

  scope :with_all_areas, -> { where(include_all_areas: true) }

  scope :with_some_areas, (proc do |area_ids|
    with_dups = joins(:areas_projects).where(areas_projects: { area_id: area_ids })
    where(id: with_dups)
  end)

  scope :with_some_topics, (proc do |topic_ids|
    joins(:projects_topics).where(projects_topics: { topic_id: topic_ids })
  end)

  scope :ordered, lambda {
    includes(:admin_publication).order('admin_publications.ordering')
  }

  scope :draft, lambda {
    includes(:admin_publication).where(admin_publications: { publication_status: 'draft' })
  }

  scope :not_draft, lambda {
    where.not(id: draft)
  }

  scope :publicly_visible, lambda {
    where(visible_to: 'public')
  }

  scope :user_groups_visible, lambda { |user|
    user_groups = Group.joins(:projects).where(projects: self).with_user(user)
    project_ids = GroupsProject.where(project: self).where(group: user_groups).select(:project_id)
    where(id: project_ids)
  }

  scope :not_in_draft_folder, lambda {
    joins(:admin_publication)
      .joins('LEFT OUTER JOIN admin_publications AS parent_pubs ON admin_publications.parent_id = parent_pubs.id')
      .where("admin_publications.parent_id IS NULL OR parent_pubs.publication_status != 'draft'")
  }

  alias project_id id

  delegate :published?, :ever_published?, :never_published?, to: :admin_publication, allow_nil: true

  class << self
    def search_ids_by_all_including_patches(term)
      result = defined?(super) ? super : []
      result + search_by_all(term).pluck(:id)
    end

    def generate_preview_token
      SecureRandom.urlsafe_base64(64)
    end
  end

  def project
    self
  end

  def permission_scope
    TimelineService.new.current_phase(self)
  end

  def set_default_topics!
    self.allowed_input_topics = Topic.defaults.order(:ordering).reverse
    save!
  end

  def folder
    admin_publication&.parent&.publication
  end

  def folder_id
    admin_publication&.parent&.publication_id
  end

  def in_folder?
    !!folder_id
  end

  def saved_change_to_folder?
    admin_publication.saved_change_to_parent_id?
  end

  def folder_id=(id)
    parent_id = AdminPublication.find_by(publication_type: 'ProjectFolders::Folder', publication_id: id)&.id
    raise ActiveRecord::RecordNotFound if id.present? && parent_id.nil?
    return unless folder&.admin_publication&.id != parent_id

    build_admin_publication unless admin_publication
    folder_will_change!
    admin_publication.assign_attributes(parent_id: parent_id)
  end

  def folder_changed?
    folder_changed
  end

  def folder=(folder)
    self.folder_id = folder.id
  end

  def folder_will_change!
    self.folder_was = folder
    self.folder_changed = true
  end

  def clear_folder_changes
    self.folder_changed = false
  end

  # @return [ParticipationMethod::Base]
  def pmethod
    # NOTE: if a project is passed to this method, timeline projects used to always return 'Ideation'
    # as it was never set and defaulted to this when the participation_method was available on the project
    # The following mimics the same behaviour now that participation method is not available on the project
    # TODO: Maybe change to find phase with ideation or voting where created date between start and end date?
    @pmethod ||= ParticipationMethod::Ideation.new(phases.first)
  end

  def refresh_preview_token
    self.preview_token = self.class.generate_preview_token
  end

  def hidden?
    hidden
  end

  private

  def admin_publication_must_exist
    # Built-in presence validation does not work.
    # Admin publication must always be present
    # once the project was created.
    return unless id.present? && admin_publication&.id.blank?

    errors.add(:admin_publication_id, :blank, message: "Admin publication can't be blank")
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

  def set_visible_to
    self.visible_to ||= 'public'
  end

  def strip_title
    return unless title_multiloc&.any?

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

  def remove_moderators
    UserRoleService.new.moderators_for_project(self).each do |moderator|
      moderator.delete_role 'project_moderator', project_id: id
      moderator.save!
    end
  end

  def reassign_moderators
    add_new_folder_moderators
    remove_old_folder_moderators
  end

  def add_new_folder_moderators
    new_folder_moderators.each do |moderator|
      next if moderator.moderatable_project_ids.include?(id)

      moderator.add_role('project_moderator', project_id: id)
      moderator.save
    end
  end

  def remove_old_folder_moderators
    old_folder_moderators.each do |moderator|
      next unless moderator.moderatable_project_ids.include?(id)

      moderator.delete_role('project_moderator', project_id: id)
      moderator.save
    end
  end

  def new_folder_moderators
    return ::User.none unless folder&.id

    ::User.project_folder_moderator(folder&.id)
  end

  def old_folder_moderators
    return ::User.none unless folder_was.is_a?(ProjectFolders::Folder)

    ::User.project_folder_moderator(folder_was.id)
  end
end

Project.include(SmartGroups::Concerns::ValueReferenceable)
Project.include(CustomMaps::Extensions::Project)
Project.include(IdeaAssignment::Extensions::Project)
Project.include(ContentBuilder::Patches::Project)
Project.include(Analysis::Patches::Project)
Project.include(EmailCampaigns::Extensions::Project)
Project.include(BulkImportIdeas::Patches::Project)

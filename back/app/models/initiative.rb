# frozen_string_literal: true

# == Schema Information
#
# Table name: initiatives
#
#  id                       :uuid             not null, primary key
#  title_multiloc           :jsonb
#  body_multiloc            :jsonb
#  publication_status       :string
#  published_at             :datetime
#  author_id                :uuid
#  upvotes_count            :integer          default(0), not null
#  downvotes_count          :integer          default(0), not null
#  location_point           :geography        point, 4326
#  location_description     :string
#  slug                     :string
#  comments_count           :integer          default(0), not null
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  header_bg                :string
#  assignee_id              :uuid
#  official_feedbacks_count :integer          default(0), not null
#  assigned_at              :datetime
#
# Indexes
#
#  index_initiatives_on_author_id       (author_id)
#  index_initiatives_on_location_point  (location_point) USING gist
#  index_initiatives_on_slug            (slug) UNIQUE
#  index_initiatives_search             (((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text))))) USING gin
#
# Foreign Keys
#
#  fk_rails_...  (assignee_id => users.id)
#  fk_rails_...  (author_id => users.id)
#
class Initiative < ApplicationRecord
  include Post

  mount_base64_uploader :header_bg, InitiativeHeaderBgUploader

  has_many :initiative_images, -> { order(:ordering) }, dependent: :destroy
  has_many :initiative_files, -> { order(:ordering) }, dependent: :destroy

  has_many :initiatives_topics, dependent: :destroy
  has_many :topics, through: :initiatives_topics
  has_many :areas_initiatives, dependent: :destroy
  has_many :areas, through: :areas_initiatives
  has_many :initiative_status_changes, dependent: :destroy
  has_one :initiative_initiative_status
  has_one :initiative_status, through: :initiative_initiative_status
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images

  belongs_to :assignee, class_name: 'User', optional: true

  with_options unless: :draft? do |post|
    post.validates :title_multiloc, presence: true, multiloc: { presence: true }
    post.validates :body_multiloc, presence: true, multiloc: { presence: true, html: true }
    post.validates :author, presence: true, on: :publication
    post.validates :author, presence: true, if: :author_id_changed?
    post.validates :slug, uniqueness: true, presence: true

    post.before_validation :strip_title
    post.before_validation :generate_slug
    post.after_validation :set_published_at, if: ->(record) { record.published? && record.publication_status_changed? }
    post.after_validation :set_assigned_at, if: ->(record) { record.assignee_id && record.assignee_id_changed? }
  end

  with_options unless: :draft? do
    # Problem is that this validation happens too soon, as the first idea status change is created after create.
    # initiative.validates :initiative_status, presence: true
    validates :initiative_status_changes, presence: true
    validate :assignee_can_moderate_initiatives

    before_validation :initialize_initiative_status_changes
    before_validation :sanitize_body_multiloc, if: :body_multiloc
  end

  scope :with_some_topics, (proc do |topic_ids|
    with_dups = joins(:initiatives_topics)
      .where(initiatives_topics: { topic_id: topic_ids })
    where(id: with_dups)
  end)

  scope :with_some_areas, (proc do |area_ids|
    with_dups = joins(:areas_initiatives)
      .where(areas_initiatives: { area_id: area_ids })
    where(id: with_dups)
  end)

  scope :with_status_code, (proc do |code|
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .where(initiative_statuses: { code: code })
  end)

  scope :order_status, lambda { |direction = :asc|
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .order("initiative_statuses.ordering #{direction}, initiatives.published_at #{direction}, initiatives.id")
  }

  scope :feedback_needed, lambda {
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .where(initiative_statuses: { code: 'threshold_reached' })
  }

  scope :no_feedback_needed, lambda {
    includes(initiative_initiative_status: :initiative_status)
      .where.not(initiative_statuses: { code: 'threshold_reached' })
  }

  scope :proposed, lambda {
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .where(initiative_statuses: { code: 'proposed' })
  }

  def votes_needed(configuration = AppConfiguration.instance)
    [configuration.settings('initiatives', 'voting_threshold') - upvotes_count, 0].max
  end

  def expires_at(configuration = AppConfiguration.instance)
    return nil unless published?

    published_at + configuration.settings('initiatives', 'days_limit').days
  end

  def threshold_reached_at
    initiative_status_changes
      .where(initiative_status: InitiativeStatus.where(code: 'threshold_reached'))
      .order(:created_at).pluck(:created_at).last
  end

  private

  def generate_slug
    return if slug

    title = MultilocService.new.t title_multiloc, author
    self.slug ||= SlugService.new.generate_slug self, title
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      body_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags(body_multiloc)
    self.body_multiloc = service.linkify_multiloc(body_multiloc)
  end

  def assignee_can_moderate_initiatives
    return unless assignee && !UserRoleService.new.can_moderate_initiatives?(assignee)

    errors.add(
      :assignee_id,
      :assignee_can_not_moderate_initiatives,
      message: 'The assignee can not moderate citizen initiatives'
    )
  end

  def initialize_initiative_status_changes
    initial_status = InitiativeStatus.find_by code: 'proposed'
    return unless initial_status && initiative_status_changes.empty? && !draft?

    initiative_status_changes.build(initiative_status: initial_status)
  end
end

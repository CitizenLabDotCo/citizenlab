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
#  likes_count              :integer          default(0), not null
#  dislikes_count           :integer          default(0), not null
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
#  author_hash              :string
#  anonymous                :boolean          default(FALSE), not null
#  internal_comments_count  :integer          default(0), not null
#  editing_locked           :boolean          default(FALSE), not null
#  followers_count          :integer          default(0), not null
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
# TODO: cleanup-after-proposals-migration
class Initiative < ApplicationRecord
  include Post
  include AnonymousParticipation

  slug from: proc { |initiative| MultilocService.new.t(initiative.title_multiloc, initiative.author&.locale) }, if: proc(&:published?)

  mount_base64_uploader :header_bg, InitiativeHeaderBgUploader

  has_many :initiative_images, -> { order(:ordering) }, dependent: :destroy
  has_many :initiative_files, -> { order(:ordering) }, dependent: :destroy

  has_many :initiatives_topics, dependent: :destroy
  has_many :topics, -> { order(:ordering) }, through: :initiatives_topics
  has_many :areas_initiatives, dependent: :destroy
  has_many :areas, through: :areas_initiatives
  has_many :cosponsors_initiatives, dependent: :destroy
  has_many :cosponsors, through: :cosponsors_initiatives, source: :user, dependent: :destroy # dependent: :destroy destroys the associated cosponsors_inititiatve records, not the users
  has_many :initiative_status_changes, dependent: :destroy
  has_one :initiative_initiative_status
  has_one :initiative_status, through: :initiative_initiative_status
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  has_many :followers, as: :followable, dependent: :destroy

  belongs_to :assignee, class_name: 'User', optional: true

  validates :author, presence: true, on: :publication, unless: :anonymous?

  with_options unless: :draft? do |post|
    post.validates :title_multiloc, presence: true, multiloc: { presence: true }
    post.validates :body_multiloc, presence: true, multiloc: { presence: true, html: true }
    post.validates :author, presence: true, if: :author_required_on_change?

    post.before_validation :strip_title
    post.after_validation :set_published_at, if: ->(record) { record.published? && record.publication_status_changed? }
    post.after_validation :set_assigned_at, if: ->(record) { record.assignee_id && record.assignee_id_changed? }
  end

  with_options unless: :draft? do
    # Problem is that this validation happens too soon, as the first idea status change is created after create.
    # initiative.validates :initiative_status, presence: true
    validates :initiative_status_changes, presence: true, if: proc { |initiative| !initiative.draft? && !Current.loading_tenant_template }
    validate :assignee_can_moderate_initiatives

    before_validation :initialize_initiative_status_changes
    before_validation :sanitize_body_multiloc, if: :body_multiloc
  end

  pg_search_scope :search_by_all,
    against: %i[title_multiloc body_multiloc],
    using: { tsearch: { prefix: true } }

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

  scope :with_status_code, proc { |code| joins(:initiative_status).where(initiative_status: { code: code }) }

  scope :order_status, lambda { |direction = :asc|
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .order("initiative_statuses.ordering #{direction}, initiatives.published_at #{direction}, initiatives.id")
  }

  scope :order_accepted_cosponsorships, lambda { |direction = :desc|
    joins('LEFT OUTER JOIN cosponsors_initiatives ON initiatives.id = cosponsors_initiatives.initiative_id AND cosponsors_initiatives.status = \'accepted\'')
      .group('cosponsors_initiatives.initiative_id', 'initiatives.id')
      .order("COUNT(cosponsors_initiatives.id) #{direction}, initiatives.published_at #{direction}, initiatives.id")
  }

  scope :feedback_needed, -> { with_status_code('threshold_reached') }
  scope :no_feedback_needed, -> { with_status_code(InitiativeStatus::CODES - ['threshold_reached']) }
  scope :proposed, -> { with_status_code('proposed') }
  scope :voteable_status, -> { with_status_code(InitiativeStatus::REVIEW_CODES + ['proposed']) }

  scope :proposed_before, (proc do |time|
    with_proposed_status_changes.where('initiative_status_changes.created_at < ?', time)
  end)
  scope :proposed_after, (proc do |time|
    with_proposed_status_changes.where('initiative_status_changes.created_at > ?', time)
  end)
  scope :with_proposed_status_changes, (proc do
    joins(:initiative_status_changes)
      .where(initiative_status_changes: { initiative_status: InitiativeStatus.find_by(code: 'proposed') })
  end)

  scope :activity_after, lambda { |time_ago|
    joins(:initiative_status_changes)
      .where(
        'initiative_status_changes.initiative_status_id IN (?) AND initiative_status_changes.created_at > ?',
        InitiativeStatus.where(code: %w[threshold_reached proposed]).ids,
        time_ago
      )
  }

  def self.review_required?
    app_config = AppConfiguration.instance
    require_review = app_config.settings('initiatives', 'require_review')

    app_config.feature_activated?('initiative_review') && require_review
  end

  def cosponsor_ids=(ids)
    super(ids.uniq.excluding(author_id))
  end

  def reactions_needed(configuration = AppConfiguration.instance)
    [configuration.settings('initiatives', 'reacting_threshold') - likes_count, 0].max
  end

  def expires_at(configuration = AppConfiguration.instance)
    return nil unless published?

    (proposed_at || published_at) + configuration.settings('initiatives', 'days_limit').days
  end

  def threshold_reached_at
    initiative_status_changed_at('threshold_reached')
  end

  def review_status?
    InitiativeStatus::REVIEW_CODES.include? initiative_status&.code
  end

  def proposed_at
    initiative_status_changed_at('proposed')
  end

  private

  def initiative_status_changed_at(initiative_status_code)
    initiative_status_changes
      .where(initiative_status: InitiativeStatus.where(code: initiative_status_code))
      .order(:created_at).pluck(:created_at).last
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
    initial_status = InitiativeStatus.find_by(code: InitiativeStatus.initial_status_code)
    return unless initial_status && initiative_status_changes.empty? && !draft?

    initiative_status_changes.build(initiative_status: initial_status)
  end

  def author_required_on_change?
    author_id_changed? && !anonymous?
  end
end

Initiative.include(SmartGroups::Concerns::ValueReferenceable)
Initiative.include(FlagInappropriateContent::Concerns::Flaggable)
Initiative.include(Moderation::Concerns::Moderatable)
Initiative.include(MachineTranslations::Concerns::Translatable)

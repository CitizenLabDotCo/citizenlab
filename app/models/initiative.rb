class Initiative < ApplicationRecord
  include MachineTranslations::InitiativeDecorator
  include Post
  include Moderatable

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

  with_options unless: :draft? do |initiative|
    # Problem is that this validation happens too soon, as the first idea status change is created after create.
    # initiative.validates :initiative_status, presence: true
    initiative.validates :initiative_status_changes, presence: true
    initiative.validate :assignee_can_moderate_initiatives

    initiative.before_validation :initialize_initiative_status_changes
    initiative.before_validation :sanitize_body_multiloc, if: :body_multiloc
  end


  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    joins(:initiatives_topics)
      .where(initiatives_topics: {topic_id: uniq_topic_ids})
      .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)
  end)

  scope :with_some_topics, (Proc.new do |topic_ids|
    with_dups = joins(:initiatives_topics)
      .where(initiatives_topics: {topic_id: topic_ids})
    where(id: with_dups)
  end)

  scope :with_all_areas, (Proc.new do |area_ids|
    uniq_area_ids = area_ids.uniq
    joins(:areas_initiatives)
      .where(areas_initiatives: {area_id: uniq_area_ids})
      .group(:id).having("COUNT(*) = ?", uniq_area_ids.size)
  end)

  scope :with_some_areas, (Proc.new do |area_ids|
    with_dups = joins(:areas_initiatives)
      .where(areas_initiatives: {area_id: area_ids})
    where(id: with_dups)
  end)

  scope :with_status_code, (Proc.new do |code|
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .where('initiative_statuses.code = ?', code)
  end)

  scope :order_status, -> (direction=:asc) {
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .order("initiative_statuses.ordering #{direction}, initiatives.published_at #{direction}, initiatives.id")
  }

  scope :feedback_needed, -> {
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .where('initiative_statuses.code = ?', 'threshold_reached')
  }

  scope :proposed, -> {
    joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
      .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
      .where('initiative_statuses.code = ?', 'proposed')
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

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      self.body_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags(self.body_multiloc)
    self.body_multiloc = service.linkify_multiloc(self.body_multiloc)
  end

  def assignee_can_moderate_initiatives
    if self.assignee && !InitiativePolicy.new(self.assignee, self).moderate?
      self.errors.add(
        :assignee_id,
        :assignee_can_not_moderate_initiatives,
        message: 'The assignee can not moderate citizen initiatives'
      )
    end
  end

  def initialize_initiative_status_changes
    initial_status = InitiativeStatus.find_by code: 'proposed'
    if initial_status && self.initiative_status_changes.empty? && !self.draft?
      self.initiative_status_changes.build(initiative_status: initial_status)
    end
  end

end

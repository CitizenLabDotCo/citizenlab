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

  belongs_to :assignee, class_name: 'User', optional: true

  with_options unless: :draft? do |initiative|
    # Problem is that this validation happens too soon, as the first idea status change is created after create.
    initiative.validates :initiative_status_changes, presence: true
    initiative.validate :assignee_can_moderate_initiatives

    initiative.before_validation :set_initiative_status
  end


  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    joins(:initiatives_topics)
    .where(initiatives_topics: {topic_id: uniq_topic_ids})
    .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)
  end)

  scope :with_some_topics, (Proc.new do |topic_ids|
    joins(:initiatives_topics)
      .where(initiatives_topics: {topic_id: topic_ids})
  end)

  scope :with_all_areas, (Proc.new do |area_ids|
    uniq_area_ids = area_ids.uniq
    joins(:areas_initiatives)
    .where(areas_initiatives: {area_id: uniq_area_ids})
    .group(:id).having("COUNT(*) = ?", uniq_area_ids.size)
  end)

  scope :with_some_areas, (Proc.new do |area_ids|
    joins(:areas_initiatives)
      .where(areas_initiatives: {area_id: area_ids})
  end)

  scope :with_status, (Proc.new do |status_id|
    join_initiative_status.where('initiative_statuses.id = ?', status_id)
  end)

  scope :order_status, -> (direction=:desc) {
    join_initiative_status
    .order("initiative_statuses.ordering #{direction}, initiatives.published_at #{direction}, initiatives.id")
  }

  scope :feedback_needed, -> {
    join_initiative_status.where(initiative_statuses: {code: 'threshold_reached'})
      .where('initiatives.id NOT IN (SELECT DISTINCT(post_id) FROM official_feedbacks)')
  }


  def self.join_initiative_status
    # This would have been nice but doesn't work.
    # joins(:initiative_status_changes)
    #   .select('initiatives.*, max(initiative_status_changes.created_at)')
    #   .group('initiatives.id')
    #   .joins("INNER JOIN initiative_statuses ON initiative_statuses.id = initiative_status_changes.initiative_status_id")
    with_last_status_changed_at
      .joins("""
        INNER JOIN initiative_status_changes 
        ON initiatives.id = initiative_status_changes.initiative_id 
        AND last_status_changed_at = initiative_status_changes.created_at
        """)
      .joins("""
        INNER JOIN initiative_statuses 
        ON initiative_statuses.id = initiative_status_changes.initiative_status_id
        """)
  end


  def initiative_status
    # byebug if !initiative_status_changes.order(created_at: :desc).first
    InitiativeStatus.find initiative_status_changes.order(created_at: :desc).first.initiative_status_id
  end


  private

  def self.with_last_status_changed_at
    # This would have been nice but doesn't work.
    # joins(:initiative_status_changes)
    #   .select('initiatives.id, max(initiative_status_changes.created_at) AS initiatives.last_status_changed_at')
    #   .group('initiatives.id')
    joins("""
      INNER JOIN (
        SELECT initiative_id, max(initiative_status_changes.created_at) AS last_status_changed_at 
        FROM initiative_status_changes 
        GROUP BY initiative_status_changes.initiative_id
        ) AS aardvark 
      ON initiatives.id = aardvark.initiative_id
      """)
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

  def set_initiative_status
    initial_status = InitiativeStatus.find_by code: 'proposed'
    if initial_status && self.initiative_status_changes.empty? && !self.draft?
      self.initiative_status_changes.build(initiative_status: initial_status) 
    end
  end

end

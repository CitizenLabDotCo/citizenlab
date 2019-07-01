class Initiative < ApplicationRecord
  include Post

  mount_base64_uploader :header_bg, InitiativeHeaderBgUploader

  has_many :initiative_images, -> { order(:ordering) }, dependent: :destroy
  has_many :initiative_files, -> { order(:ordering) }, dependent: :destroy

  has_many :initiatives_topics, dependent: :destroy
  has_many :topics, through: :initiatives_topics
  has_many :areas_initiatives, dependent: :destroy
  has_many :areas, through: :areas_initiatives

  belongs_to :initiative_status, optional: true

  belongs_to :assignee, class_name: 'User', optional: true

  validates :initiative_status, presence: true, unless: :draft?
  validate :assignee_can_moderate_initiatives, unless: :draft?

  before_validation :set_initiative_status


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

  scope :order_status, -> (direction=:desc) {
    joins(:initiative_status)
    .order("initiative_statuses.ordering #{direction}")
  }


  private

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
    self.initiative_status ||= InitiativeStatus.find_by!(code: 'published') unless self.draft?
  end

end

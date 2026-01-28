# frozen_string_literal: true

# == Schema Information
#
# Table name: comments
#
#  id                 :uuid             not null, primary key
#  author_id          :uuid
#  idea_id            :uuid
#  parent_id          :uuid
#  lft                :integer          not null
#  rgt                :integer          not null
#  body_multiloc      :jsonb
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  likes_count        :integer          default(0), not null
#  dislikes_count     :integer          default(0), not null
#  publication_status :string           default("published"), not null
#  body_updated_at    :datetime
#  children_count     :integer          default(0), not null
#  author_hash        :string
#  anonymous          :boolean          default(FALSE), not null
#
# Indexes
#
#  index_comments_on_author_id   (author_id)
#  index_comments_on_created_at  (created_at)
#  index_comments_on_idea_id     (idea_id)
#  index_comments_on_lft         (lft)
#  index_comments_on_parent_id   (parent_id)
#  index_comments_on_rgt         (rgt)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (idea_id => ideas.id)
#
class Comment < ApplicationRecord
  include AnonymousParticipation
  include LocationTrackableParticipation

  acts_as_nested_set dependent: :destroy, counter_cache: :children_count

  belongs_to :idea
  delegate :project_id, :project, to: :idea

  belongs_to :author, class_name: 'User', optional: true
  has_many :reactions, as: :reactable, dependent: :destroy
  has_many :likes, -> { where(mode: 'up') }, as: :reactable, class_name: 'Reaction'
  has_many :dislikes, -> { where(mode: 'down') }, as: :reactable, class_name: 'Reaction'
  has_one :user_reaction, ->(user_id) { where(user_id: user_id) }, as: :reactable, class_name: 'Reaction'
  has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy

  before_validation :set_publication_status, on: :create
  before_validation :sanitize_body_multiloc
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify
  has_one :wise_voice_flag, as: :flaggable, class_name: 'WiseVoiceFlag', dependent: :destroy

  counter_culture(
    :idea,
    column_name: proc { |model| model.published? ? 'comments_count' : nil },
    column_names: {
      ['comments.publication_status = ?', 'published'] => 'comments_count'
    },
    touch: true
  )
  counter_culture(
    %i[idea project],
    column_name: proc { |model| model.published? ? 'comments_count' : nil },
    column_names: {
      ['comments.publication_status = ?', 'published'] => 'comments_count'
    },
    touch: true
  )

  PUBLICATION_STATUSES = %w[published deleted]

  validates :idea, presence: true
  validates :body_multiloc, presence: true, multiloc: { presence: true, html: true }
  validates :publication_status, presence: true, inclusion: { in: PUBLICATION_STATUSES }

  scope :published, -> { where publication_status: 'published' }

  def published?
    publication_status == 'published'
  end

  def author_name
    @author_name ||= author&.full_name
  end

  private

  def set_publication_status
    self.publication_status ||= 'published'
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc body_multiloc, %i[mention]
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags body_multiloc
    self.body_multiloc = service.linkify_multiloc body_multiloc
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update comment: nil
        notification.destroy!
      end
    end
  end
end

Comment.include(FlagInappropriateContent::Concerns::Flaggable)
Comment.include(Moderation::Concerns::Moderatable)
Comment.include(MachineTranslations::Concerns::Translatable)

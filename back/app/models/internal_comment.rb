# frozen_string_literal: true

# == Schema Information
#
# Table name: internal_comments
#
#  id                 :uuid             not null, primary key
#  author_id          :uuid
#  idea_id            :uuid
#  parent_id          :uuid
#  lft                :integer          not null
#  rgt                :integer          not null
#  body               :text             not null
#  publication_status :string           default("published"), not null
#  body_updated_at    :datetime
#  children_count     :integer          default(0), not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_internal_comments_on_author_id   (author_id)
#  index_internal_comments_on_created_at  (created_at)
#  index_internal_comments_on_idea_id     (idea_id)
#  index_internal_comments_on_lft         (lft)
#  index_internal_comments_on_parent_id   (parent_id)
#  index_internal_comments_on_rgt         (rgt)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (idea_id => ideas.id)
#
class InternalComment < ApplicationRecord
  acts_as_nested_set dependent: :destroy, counter_cache: :children_count

  belongs_to :author, class_name: 'User', optional: true
  belongs_to :idea

  before_validation :set_publication_status, on: :create
  before_validation :sanitize_body
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  counter_culture(
    :idea,
    column_name: proc { |model| model.published? ? 'internal_comments_count' : nil },
    column_names: {
      ['internal_comments.publication_status = ?', 'published'] => 'internal_comments_count'
    },
    touch: true
  )

  PUBLICATION_STATUSES = %w[published deleted]

  validates :body, :idea, presence: true
  validates :publication_status, presence: true, inclusion: { in: PUBLICATION_STATUSES }

  scope :published, -> { where publication_status: 'published' }

  delegate :project_id, to: :idea

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

  def sanitize_body
    service = SanitizationService.new
    self.body = service.sanitize body, %i[mention]
    self.body = service.remove_empty_trailing_tags body
    self.body = service.linkify body
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update internal_comment: nil
        notification.destroy!
      end
    end
  end
end

# frozen_string_literal: true

# == Schema Information
#
# Table name: internal_comments
#
#  id                 :uuid             not null, primary key
#  author_id          :uuid
#  post_type          :string
#  post_id            :uuid
#  parent_id          :uuid
#  lft                :integer          not null
#  rgt                :integer          not null
#  body_text          :text             not null
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
#  index_internal_comments_on_lft         (lft)
#  index_internal_comments_on_parent_id   (parent_id)
#  index_internal_comments_on_post        (post_type,post_id)
#  index_internal_comments_on_post_id     (post_id)
#  index_internal_comments_on_rgt         (rgt)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
class InternalComment < ApplicationRecord
  acts_as_nested_set dependent: :destroy, counter_cache: :children_count

  belongs_to :author, class_name: 'User', optional: true
  belongs_to :post, polymorphic: true

  before_validation :set_publication_status, on: :create
  before_validation :sanitize_body_text
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  counter_culture(
    :post,
    column_name: proc { |model| model.published? ? 'internal_comments_count' : nil },
    column_names: {
      ['internal_comments.publication_status = ?', 'published'] => 'internal_comments_count'
    },
    touch: true
  )

  # rubocop:disable Rails/InverseOf
  # This code allows us to do something like comments.include(:idea)
  # After https://stackoverflow.com/a/16124295/3585671
  belongs_to :idea, -> { joins(:internal_comments).where(internal_comments: { post_type: 'Idea' }) },
    foreign_key: 'post_id',
    optional: true,
    class_name: 'Idea'

  def idea
    return unless post_type == 'Idea'

    super
  end

  belongs_to :initiative, -> { joins(:internal_comments).where(internal_comments: { post_type: 'Initiative' }) },
    foreign_key: 'post_id',
    optional: true,
    class_name: 'Initiative'

  def initiative
    return unless post_type == 'Initiative'

    super
  end
  # rubocop:enable Rails/InverseOf

  PUBLICATION_STATUSES = %w[published deleted]

  validates :body_text, presence: true
  validates :publication_status, presence: true, inclusion: { in: PUBLICATION_STATUSES }

  scope :published, -> { where publication_status: 'published' }

  def published?
    publication_status == 'published'
  end

  def author_name
    @author_name ||= author&.full_name
  end

  def project_id
    post.try(:project_id)
  end

  private

  def set_publication_status
    self.publication_status ||= 'published'
  end

  def sanitize_body_text
    service = SanitizationService.new
    self.body_text = service.sanitize body_text, %i[mention]
    self.body_text = service.remove_empty_trailing_tags body_text
    self.body_text = service.linkify body_text
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update internal_comment: nil
        notification.destroy!
      end
    end
  end
end

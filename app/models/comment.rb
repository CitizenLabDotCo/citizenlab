class Comment < ApplicationRecord
  include MachineTranslations::CommentDecorator
  include Moderatable

  acts_as_nested_set dependent: :destroy, counter_cache: :children_count

  belongs_to :author, class_name: 'User', optional: true
  belongs_to :post, polymorphic: true
  has_many :votes, as: :votable, dependent: :destroy
  has_many :upvotes, -> { where(mode: "up") }, as: :votable, class_name: 'Vote'
  has_many :downvotes, -> { where(mode: "down") }, as: :votable, class_name: 'Vote'
  has_one :user_vote, -> (user_id) {where(user_id: user_id)}, as: :votable, class_name: 'Vote'
  has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy
  before_destroy :remove_notifications
  has_many :notifications, foreign_key: :comment_id, dependent: :nullify

  counter_culture :post,
    column_name: proc {|model| model.published? ? 'comments_count' : nil },
    column_names: {
      ["comments.publication_status = ?", "published"] => "comments_count"
    },
    touch: true
  counter_culture [:idea, :project],
    column_name: proc {|model| model.published? ? 'comments_count' : nil },
    column_names: {
      ["comments.publication_status = ?", "published"] => "comments_count"
    },
    touch: true

  # This code allows us to do something like comments.include(:idea)
  # After https://stackoverflow.com/a/16124295/3585671
  belongs_to :idea, -> { joins(:comments).where(comments: {post_type: 'Idea'}) }, foreign_key: 'post_id', optional: true, class_name: 'Idea'
  def idea
    return unless post_type == 'Idea'
    super
  end
  belongs_to :initiative, -> { joins(:comments).where(comments: {post_type: 'Initiative'}) }, foreign_key: 'post_id', optional: true, class_name: 'Initiative'
  def initiative
    return unless post_type == 'Initiative'
    super
  end

  PUBLICATION_STATUSES = %w(published deleted)

  validates :body_multiloc, presence: true, multiloc: {presence: true}
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}

  before_validation :set_publication_status, on: :create
  before_validation :sanitize_body_multiloc

  scope :published, -> {where publication_status: 'published'}


  def published?
    self.publication_status == 'published'
  end

  def author_name
    @author_name ||= author.nil? ? nil : author.full_name
  end

  private

  def set_publication_status
    self.publication_status ||= 'published'
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      self.body_multiloc,
      %i{mention}
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags(self.body_multiloc)
    self.body_multiloc = service.linkify_multiloc(self.body_multiloc)
  end

  def remove_notifications
    notifications.each do |notification|
      if !notification.update comment_id: nil
        notification.destroy!
      end
    end
  end

end

class Comment < ApplicationRecord
  acts_as_nested_set
  belongs_to :author, class_name: 'User'
  belongs_to :idea
  has_many :votes, as: :votable, dependent: :destroy
  has_many :upvotes, -> { where(mode: "up") }, as: :votable, class_name: 'Vote'
  has_many :downvotes, -> { where(mode: "down") }, as: :votable, class_name: 'Vote'
  has_one :user_vote, -> (user_id) {where(user_id: user_id)}, as: :votable, class_name: 'Vote'
  has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy
  has_many :notifications, foreign_key: :comment_id, dependent: :nullify
  
  counter_culture :idea

  validates :body_multiloc, presence: true, multiloc: {presence: true}
  validates :author_name, presence: true
  validates :author, presence: true, on: :create

  before_validation :set_author_name, on: :create

  def set_author_name
    self.author_name = self.author.display_name if self.author
  end

  def project
    self.idea&.project
  end
end

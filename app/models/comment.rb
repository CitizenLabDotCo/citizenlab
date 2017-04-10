class Comment < ApplicationRecord
  acts_as_nested_set
  belongs_to :author, class_name: 'User'
  belongs_to :idea
  # belongs_to :parent, class_name: 'Comment', optional: true

  validates :body_multiloc, presence: true, multiloc: {presence: true}
  validates :author_name, presence: true

  before_validation :set_author_name, on: :create

  def set_author_name
    self.author_name = self.author.display_name if self.author
  end
end

class PageLink < ApplicationRecord
  belongs_to :linking_page, :class_name => :Page
  belongs_to :linked_page, :class_name => :Page

  validates :linking_page, :linked_page, presence: true
end

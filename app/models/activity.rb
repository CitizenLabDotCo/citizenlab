class Activity < ApplicationRecord
  belongs_to :user
  belongs_to :item, polymorphic: true

  validates :action, presence: true
end

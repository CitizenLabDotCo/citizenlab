class Activity < ApplicationRecord
  belongs_to :user
  belongs_to :item, polymorphic: true, optional: true

  validates :action, :item_type, :item_id, presence: true
end

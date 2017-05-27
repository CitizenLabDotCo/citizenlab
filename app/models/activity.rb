class Activity < ApplicationRecord
  belongs_to :user
  belongs_to :item, polymorphic: true
end

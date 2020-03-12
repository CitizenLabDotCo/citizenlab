class AdminPublication < ApplicationRecord
  acts_as_nested_set dependent: :destroy, counter_cache: :children_count

  belongs_to :publication, polymorphic: true

  validates :publication, presence: true
end
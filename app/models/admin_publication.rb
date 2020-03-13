class AdminPublication < ApplicationRecord
  acts_as_nested_set dependent: :destroy, counter_cache: :children_count, order_column: :ordering
  acts_as_list column: :ordering, top_of_list: 0, scope: [:parent_id], add_new_at: :top

  belongs_to :publication, polymorphic: true

  validates :publication, presence: true
end
class AdminPublication < ApplicationRecord
  acts_as_nested_set dependent: :destroy, counter_cache: :children_count, order_column: :ordering
  # Awesome nested set does not manage the
  # ordering attribute (e.g. upon creation) so we
  # keep using acts_as_list for this.
  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top, scope: [:parent_id]

  belongs_to :publication, polymorphic: true

  validates :publication, presence: true
end
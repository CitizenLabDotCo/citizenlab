class FolderOrProjectOrdering < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top

  belongs_to :containable, polymorphic: true

  validates :containable, presence: true
end

module Tagging
  class Tagging < ApplicationRecord
    enum assignment_method: %i[automatic manual pending]

    belongs_to :idea
    belongs_to :tag, optional: true

    accepts_nested_attributes_for :tag
    validates_uniqueness_of :tag_id, scope: :idea_id
  end
end

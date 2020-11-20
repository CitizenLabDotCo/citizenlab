module Tagging
  class Tagging < ApplicationRecord
    enum assignment_method: %i[automatic manual]

    belongs_to :idea
    belongs_to :tag

    accepts_nested_attributes_for :tag
  end
end

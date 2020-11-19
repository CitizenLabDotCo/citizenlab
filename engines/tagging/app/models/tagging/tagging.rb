module Tagging
  class Tagging < ApplicationRecord
    enum assignment_method: %i[automatic manual]

    belongs_to :idea
    belongs_to :tag

  end
end

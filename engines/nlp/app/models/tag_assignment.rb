  class TagAssignment < ApplicationRecord
    enum assignment_method: [ :automatic, :manual ]

    belongs_to :idea
    belongs_to :tag

  end

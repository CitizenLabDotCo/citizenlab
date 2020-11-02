module NLP
  class TagAssignment < ApplicationRecord
    METHOD = %w(manual automatic)

    belongs_to :idea
    belongs_to :tag

    validates :assignment_method, inclusion: {in: METHOD}

    scope :automatic, -> {
      where(assignment_method: 'automatic')
    }

    scope :manual, -> {
      where(assignment_method: 'manual')
    }

  end
end

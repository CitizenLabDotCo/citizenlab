  class TagAssignment < ApplicationRecord
    METHOD = %w(manual automatic)

    belongs_to :idea
    belongs_to :tag

    before_validation :set_method

    validates :assignment_method, inclusion: {in: METHOD}

    scope :automatic, -> {
      where(assignment_method: 'automatic')
    }

    scope :manual, -> {
      where(assignment_method: 'manual')
    }

    private

    def set_method
      self.assignment_method ||= 'automatic'
    end
  end

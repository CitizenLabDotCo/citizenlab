module Volunteering
  class Volunteer < ApplicationRecord
    belongs_to :user
    belongs_to :cause, class_name: 'Volunteering::Cause'

    counter_culture :cause, column_name: 'volunteers_count'

    validates :cause, uniqueness: {scope: [:user]}
  end
end

module Volunteering
  class Volunteer < ApplicationRecord
    belongs_to :user
    belongs_to :cause, class_name: 'Volunteering::Cause'

    validates :cause, uniqueness: {scope: [:user]}
  end
end

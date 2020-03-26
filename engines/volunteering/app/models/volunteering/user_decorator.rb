module Volunteering::UserDecorator
  extend ActiveSupport::Concern

  included do
    has_many :volunteers, class_name: 'Volunteering::Volunteer', dependent: :destroy
  end

end

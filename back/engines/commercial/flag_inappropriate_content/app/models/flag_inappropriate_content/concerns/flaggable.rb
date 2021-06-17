require 'active_support/concern'

module FlagInappropriateContent::Concerns::Flaggable
  extend ActiveSupport::Concern

  included do
    has_one :inappropriate_content_flag, as: :flaggable, class_name: 'FlagInappropriateContent::InappropriateContentFlag', dependent: :destroy
  end

end

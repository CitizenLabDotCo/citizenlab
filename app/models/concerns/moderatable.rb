require 'active_support/concern'

module Moderatable
  extend ActiveSupport::Concern

  included do
    has_one :moderation_status
  end

end
module Polls::UserDecorator
  extend ActiveSupport::Concern

  included do
    has_many :poll_responses, class_name: 'Polls::Response', dependent: :destroy
  end

end
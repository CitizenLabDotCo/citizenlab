# frozen_string_literal: true

module UserDoorkeeper
  extend ActiveSupport::Concern

  included do
    has_many :access_grants,
      inverse_of: :resource_owner,
      class_name: 'Doorkeeper::AccessGrant',
      foreign_key: :resource_owner_id,
      dependent: :delete_all

    has_many :access_tokens,
      inverse_of: :resource_owner,
      class_name: 'Doorkeeper::AccessToken',
      foreign_key: :resource_owner_id,
      dependent: :delete_all
  end
end

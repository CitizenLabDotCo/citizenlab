# frozen_string_literal: true

module UserDoorkeeper
  extend ActiveSupport::Concern

  included do
    # `inverse_of: false`: with Doorkeeper's default (non-polymorphic) resource
    # owner, Doorkeeper::AccessGrant/AccessToken don't define a `resource_owner`
    # association, so letting Rails resolve an inverse raises
    # InverseOfAssociationNotFoundError when the association is traversed (e.g. on
    # user destroy). Disabling it explicitly also satisfies Rails/InverseOf.
    has_many :access_grants,
      inverse_of: false,
      class_name: 'Doorkeeper::AccessGrant',
      foreign_key: :resource_owner_id,
      dependent: :delete_all

    has_many :access_tokens,
      inverse_of: false,
      class_name: 'Doorkeeper::AccessToken',
      foreign_key: :resource_owner_id,
      dependent: :delete_all
  end
end

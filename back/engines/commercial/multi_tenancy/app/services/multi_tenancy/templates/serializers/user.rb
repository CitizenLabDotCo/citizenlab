# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      # Roles are not included because project ids of moderators would become invalid.
      # Pending invitations are cleared out.
      # TODO: Properly copy project moderator roles and domicile.
      class User < Base
        attributes %i[
          bio_multiloc
          block_reason
          email
          first_name
          last_name
          locale
          password_digest
          verified
        ]

        # To fix invalid SSO users without email addresses without having to serialize the Identity model
        attribute(:unique_code) { |user| user.unique_code || (user.sso? && user.email.blank? ? SecureRandom.uuid : nil) }

        attribute(:block_start_at) { |user| serialize_timestamp(user.block_start_at) }
        attribute(:registration_completed_at) { |user| serialize_timestamp(user.registration_completed_at) }

        attribute :custom_field_values do |user|
          user.custom_field_values.delete_if { |k, v| v.nil? || (k == 'domicile') }
        end

        attribute(:password, if: proc { |user| user.password_digest.blank? }) do
          SecureRandom.urlsafe_base64(32)
        end

        upload_attribute :avatar
      end
    end
  end
end

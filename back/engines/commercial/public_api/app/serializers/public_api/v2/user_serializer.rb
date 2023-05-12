# frozen_string_literal: true

class PublicApi::V2::UserSerializer < ActiveModel::Serializer
  @@multiloc_service = MultilocService.new

  attributes :id,
    :email,
    :slug,
    :roles,
    :created_at,
    :updated_at,
    :first_name,
    :last_name,
    :locale,
    :bio,
    :registration_completed_at,
    :verified,
    :email_confirmed_at,
    :email_confirmation_code_sent_at,
    :confirmation_required,
    :custom_field_values,
    # TODO: Add in these additional user stats
    # :last_access_at,
    # :first_participated_at,
    # :average_time_on_platform,
    :status

  def status
    # TODO: Include invited
    object.active? ? 'active' : 'incomplete'
  end

  def bio
    @@multiloc_service.t(object.bio_multiloc)
  end
end

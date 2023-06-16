# frozen_string_literal: true

class PublicApi::V2::UserSerializer < PublicApi::V2::BaseSerializer
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
    return 'invited' if object.invite_status == 'pending'

    object.active? ? 'active' : 'incomplete'
  end

  def bio
    multiloc_service.t(object.bio_multiloc)
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end

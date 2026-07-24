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
    :status

  def status
    return 'invited' if object.invite_status == 'pending'

    object.active? ? 'active' : 'incomplete'
  end

  # Preserves the v2 API shape: previously a column on users, now lives on the
  # active confirmation row (new_email_confirmation if a change is in flight,
  # otherwise email_confirmation).
  def email_confirmation_code_sent_at
    # Non-creating read: confirmations are created lazily, so peek at the row via
    # the association reader instead of `object.*_confirmation` (which would
    # create an empty row on every serialization of a user without one).
    name = object.new_email.present? ? :new_email_confirmation : :email_confirmation
    object.association(name).reader&.code_sent_at
  end

  def bio
    multiloc_service.t(object.bio_multiloc)
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end

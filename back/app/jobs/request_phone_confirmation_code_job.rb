# frozen_string_literal: true

class RequestPhoneConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user)
    LogActivityJob.perform_later(user, 'requested_phone_confirmation_code', user, Time.now.to_i)

    ActiveRecord::Base.transaction do
      confirmation = user.phone_confirmation || user.create_phone_confirmation!
      confirmation.reset_code!
      Sms::Sender.new.send(
        to: user.phone_number,
        body: I18n.t('sms.phone_confirmation_code', code: confirmation.code),
        user_id: user.id
      )
      confirmation.update!(code_sent_at: Time.zone.now)
      ExpireConfirmationCodeOrDeleteJob.set(
        wait_until: confirmation.expiration_at
      ).perform_later(
        user.id,
        PhoneConfirmation.name,
        confirmation.code
      )
      LogActivityJob.perform_later(user, 'received_phone_confirmation_code', user, Time.now.to_i)
    end
  end
end

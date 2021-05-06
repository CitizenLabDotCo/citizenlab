module UserConfirmation
  class SendConfirmationCode < ApplicationOrganizer
    organize ResetUserEmail,
             ResetUserConfirmationCode,
             DeliverConfirmationCode,
             ScheduleCodeExpiration

    delegate :user, to: :context

    before do
      next if user.registered_with_email?

      fail_with_error! :registration_method, :invalid, message: 'Confirmation is currently working for emails only.'
    end
  end
end

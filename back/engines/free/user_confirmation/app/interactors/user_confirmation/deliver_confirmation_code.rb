module UserConfirmation
  class DeliverConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    after do
      LogActivityJob.perform_later(user, 'confirmation_code_sent', user, Time.now.to_i)

      next unless user.email_confirmation_code_sent_at.nil?

      Raven.capture_exception("Confirmation_code_sent_at not recorded.", tags: { type: 'Interactor', app: AppConfig.instance.host, user_id: user.id })
    end

    def call
      if Rails.env.test?
        ConfirmationsMailer.with(user: user).send_confirmation_code.deliver_now
      else
        ConfirmationsMailer.with(user: user).send_confirmation_code.deliver_later(priority: 1)
      end

      user.update_attributes(email_confirmation_code_sent_at: Time.zone.now)
    end
  end
end

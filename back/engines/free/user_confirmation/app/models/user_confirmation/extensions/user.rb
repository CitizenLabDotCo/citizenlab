module UserConfirmation
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          validates :email_confirmation_code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true
          validates :email_confirmation_retry_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
          validates :email_confirmation_sent_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
        end
      end

      def reset_confirmation_code
        result                               = CodeGenerator.call
        self.email_confirmation_code         = result.code
        self.email_confirmation_code_sent_at = Time.zone.now
      end

      def increment_email_confirmation_retry_count!
        self.email_confirmation_retry_count += 1
        self.save
      end

      def increment_email_confirmation_sent_count!
        self.email_confirmation_sent_count += 1
        self.save
      end

      def reset_email(email)
        update(
          email: email,
          email_confirmation_sent_count: 0
        )
      end

      def confirm!
        return false unless registered_with_email?

        self.email_confirmed_at = Time.zone.now
        save
      end
    end
  end
end

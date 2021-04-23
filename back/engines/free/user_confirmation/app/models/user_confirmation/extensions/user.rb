module UserConfirmation
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          validates :email_confirmation_code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true
          validates :email_confirmation_retry_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
          validates :email_confirmation_code_reset_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }

          before_validation :reset_confirmation_code, unless: :email_confirmation_code, on: :create
        end
      end

      def reset_confirmation_code!
        reset_confirmation_code
        increment_confirmation_code_reset_count
        save
      end

      def increment_confirmation_retry_count!
        increment_confirmation_retry_count
        save
      end

      def increment_confirmation_code_reset_count!
        increment_confirmation_code_reset_count
        save
      end

      def reset_confirmation_code
        result                               = CodeGenerator.call
        self.email_confirmation_code         = result.code
        self.email_confirmation_code_sent_at = Time.zone.now
      end

      def increment_confirmation_code_reset_count
        self.email_confirmation_code_reset_count += 1
      end

      def increment_confirmation_retry_count
        self.email_confirmation_retry_count += 1
      end

      def reset_email(email)
        update(
          email: email,
          email_confirmation_code_reset_count: 0
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

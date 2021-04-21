module UserConfirmation
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          validates :email_confirmation_code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true

          before_validation :reset_email_confirmation_code, on: :create
        end
      end

      def confirm!
        return false unless registered_with_email?

        self.email_confirmed_at = Time.zone.now
        save
      end

      def reset_email_confirmation_code
        result = CodeGenerator.call
        self.email_confirmation_code = result.code
      end
    end
  end
end

module UserConfirmation
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          validates :email_confirmation_code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true
        end
      end

      def confirm!
        return false unless registered_with_email?

        self.email_confirmed_at = Time.zone.now
        save
      end
    end
  end
end

module UserConfirmation
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          with_options unless: :accepted_invitation? do
            validates :confirmation_code, format: USER_CONFIRMATION_CODE_PATTERN, presence: true

            before_validation :reset_confirmation_code, if: :email_valid_and_changed?
            after_create :send_confirmation_code, if: :saved_change_to_confirmation_code?
          end
        end
      end

      private

      def send_confirmation_code
        SendConfirmationCode.call(user: self)
      end

      def reset_confirmation_code
        result = CodeGenerator.call
        self.confirmation_code = result.code
      end

      def email_valid_and_changed?
        valid_attributes?(:email) && email_changed?
      end
    end
  end
end

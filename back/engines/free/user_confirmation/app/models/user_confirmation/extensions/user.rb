module UserConfirmation
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          with_options if: -> { AppConfiguration.instance.feature_activated?('user_confirmation') } do
            validates :email_confirmation_code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true
            validates :email_confirmation_retry_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
            validates :email_confirmation_code_reset_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }

            with_options if: :email_changed?, on: :create do
              before_validation :reset_confirmation_code
              before_validation :reset_confirmed_at
              before_validation :reset_confirmation_required
            end

            before_validation :confirm, if: ->(user) { user.invite_status_change&.last == 'accepted' }
          end
        end
      end

      public

      #
      # <Used to check upon update or create, if a user should have to confirm their account>
      #
      # @return [<Boolean>] <True if the user requires confirmation>
      #
      def should_require_confirmation?
        !(registered_with_phone? || highest_role != :user || identities.any? || invited? || active?)
      end

      #
      # <The reader for the private `#confirmation_required` attribute.>
      #
      # @return [<Boolean>] <True if the user has not yet confirmed their account after creation or an update to it's details.>
      #
      def confirmation_required?
        AppConfiguration.instance.feature_activated?('user_confirmation') && confirmation_required
      end

      #
      # <Returns true if the user has performed confirmation of it's account.>
      #
      # @return [<Boolean>] <True has confirmed it's account.>
      #
      def confirmed?
        email_confirmed_at.present?
      end

      def reset_confirmation_required
        self.confirmation_required = should_require_confirmation?
      end

      def confirm
        self.email_confirmed_at    = Time.zone.now
        self.confirmation_required = false
      end

      def confirm!
        return false unless registered_with_email?

        confirm
        save!
      end

      def email_confirmation_code_expiration_at
        email_confirmation_code_sent_at && email_confirmation_code_sent_at + 1.day
      end

      def reset_confirmation_code!
        reset_confirmation_code
        increment_confirmation_code_reset_count
        save!
      end

      def increment_confirmation_retry_count!
        increment_confirmation_retry_count
        save!
      end

      def increment_confirmation_code_reset_count!
        increment_confirmation_code_reset_count
        save!
      end

      def reset_confirmation_code
        result                       = CodeGenerator.call
        self.email_confirmation_code = result.code
      end

      def increment_confirmation_code_reset_count
        self.email_confirmation_code_reset_count += 1
      end

      def increment_confirmation_retry_count
        self.email_confirmation_retry_count += 1
      end

      def reset_email!(email)
        update!(
          email: email,
          email_confirmation_code_reset_count: 0
        )
      end

      def reset_confirmed_at
        self.email_confirmed_at = nil
      end

      private

      def confirmation_required
        self[:confirmation_required]
      end

      def confirmation_required=(val)
        write_attribute :confirmation_required, val
      end
    end
  end
end

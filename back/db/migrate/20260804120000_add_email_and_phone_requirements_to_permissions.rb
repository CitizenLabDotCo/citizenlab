# frozen_string_literal: true

# Replaces the `require_confirmed_email` / `require_confirmed_phone_number`
# booleans with a single `email_and_phone_requirements` enum.
#
# Two booleans can express "neither", "email", "phone" and "both", but not
# "either one, whichever the participant has" - which is what makes signing up
# with a phone number a real alternative to signing up with an email address.
# A single enum can, so the pair becomes one column:
#
#   email  phone  ->  email_and_phone_requirements
#   false  false      neither
#   true   false      email_only
#   true   true       both_email_and_phone
#   false  true       either_email_or_phone
#                     (there is no phone-only value: the sign-up flow always
#                      offers email. No such permission should exist anyway,
#                      since the sms feature is still disabled everywhere.)
class AddEmailAndPhoneRequirementsToPermissions < ActiveRecord::Migration[7.2]
  def up
    add_column :permissions, :email_and_phone_requirements, :string, null: false, default: 'email_only'

    # Plain data backfill on the small permissions table; Strong Migrations
    # cannot inspect raw execute, so we explicitly assert it is safe.
    safety_assured do
      execute(<<~SQL.squish)
        UPDATE permissions
        SET email_and_phone_requirements = CASE
          WHEN require_confirmed_email AND require_confirmed_phone_number THEN 'both_email_and_phone'
          WHEN require_confirmed_email THEN 'email_only'
          WHEN require_confirmed_phone_number THEN 'either_email_or_phone'
          ELSE 'neither'
        END;
      SQL

      remove_column :permissions, :require_confirmed_email
      remove_column :permissions, :require_confirmed_phone_number
    end
  end

  def down
    add_column :permissions, :require_confirmed_email, :boolean, null: false, default: true
    add_column :permissions, :require_confirmed_phone_number, :boolean, null: false, default: false

    # Lossy in one direction only: `either_email_or_phone` has no boolean
    # equivalent, so it degrades to the strictest combination that keeps every
    # participant who satisfied it satisfied - both channels required.
    safety_assured do
      execute(<<~SQL.squish)
        UPDATE permissions
        SET require_confirmed_email = email_and_phone_requirements IN
              ('email_only', 'both_email_and_phone', 'either_email_or_phone'),
            require_confirmed_phone_number = email_and_phone_requirements IN
              ('both_email_and_phone', 'either_email_or_phone');
      SQL

      remove_column :permissions, :email_and_phone_requirements
    end
  end
end

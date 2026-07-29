# frozen_string_literal: true

# Reworks how a permission expresses its authentication requirements.
#
# Previously the requirements were encoded entirely in `permitted_by`, using the
# `everyone_confirmed_email` and `verified` values. We now express these as
# explicit, composable boolean columns so that (for example) a `users`
# permission can independently require a confirmed email, a name, a password
# and/or verification.
#
# Migration of existing values:
#   everyone_confirmed_email -> users + require_confirmed_email
#                                     (name/password no longer required)
#   verified                 -> users + require_confirmed_email + require_verification
#                                     (name/password no longer required, see
#                                      Permissions::UserRequirementsService where all
#                                      missing attributes are dropped when verified)
class ReworkPermissionAuthRequirements < ActiveRecord::Migration[7.2]
  def up
    add_column :permissions, :require_confirmed_email, :boolean, null: false, default: true
    add_column :permissions, :confirmed_email_expiry, :integer
    add_column :permissions, :require_name, :boolean, null: false, default: true
    add_column :permissions, :require_password, :boolean, null: false, default: true
    add_column :permissions, :require_verification, :boolean, null: false, default: false

    # Plain data backfills on the small permissions table; Strong Migrations
    # cannot inspect raw execute, so we explicitly assert they are safe.
    safety_assured do
      execute(<<~SQL.squish)
        UPDATE permissions
        SET permitted_by = 'users',
            require_confirmed_email = TRUE,
            require_name = FALSE,
            require_password = FALSE
        WHERE permitted_by = 'everyone_confirmed_email';
      SQL

      execute(<<~SQL.squish)
        UPDATE permissions
        SET permitted_by = 'users',
            require_confirmed_email = FALSE,
            require_verification = TRUE,
            require_name = FALSE,
            require_password = FALSE
        WHERE permitted_by = 'verified';
      SQL
    end
  end

  def down
    # Best-effort reversal. The new flag columns let us reconstruct the old
    # `permitted_by` values for the rows this migration converted: `verified`
    # rows are exactly those with require_verification, and `everyone_confirmed_email`
    # rows are exactly those produced by the `up` step (confirmed email required,
    # name and password not required, no verification).
    safety_assured do
      execute(<<~SQL.squish)
        UPDATE permissions
        SET permitted_by = 'verified'
        WHERE permitted_by = 'users' AND require_verification = TRUE;
      SQL

      execute(<<~SQL.squish)
        UPDATE permissions
        SET permitted_by = 'everyone_confirmed_email'
        WHERE permitted_by = 'users'
          AND require_verification = FALSE
          AND require_confirmed_email = TRUE
          AND require_name = FALSE
          AND require_password = FALSE;
      SQL
    end

    remove_column :permissions, :require_verification
    remove_column :permissions, :require_password
    remove_column :permissions, :require_name
    remove_column :permissions, :confirmed_email_expiry
    remove_column :permissions, :require_confirmed_email
  end
end

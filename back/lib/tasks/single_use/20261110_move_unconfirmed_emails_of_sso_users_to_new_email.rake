# frozen_string_literal: true

# An unconfirmed address may only sit in `email` while a user signs up for the first time, before
# they hold a token. Some users with an identity (SSO / verification) still have one there. They
# can sign in through their identity, but `email_action_required` then asks them to confirm that
# `email` in place, which only the signed-out flow can do. They are stuck.
#
# This moves the unconfirmed address to `new_email`, the place where a signed-in user's unconfirmed
# address belongs, and clears `email`. The user is then asked to confirm their new email (a flow
# that works while signed in) and the address does not have to be typed in again.
#
# The address is only moved when no other address is pending. If the user already has a
# `new_email` (e.g. the copy an earlier, now removed limbo task put there) or a
# `merge_target_email`, that pending flow is kept and `email` is only cleared. The report records
# the dropped address in that case, as it is not kept anywhere else.
#
# Pending invitees are left alone: the invite flow owns their email.
#
# `update_columns` is used on purpose. It skips validations that unrelated legacy data can fail
# (e.g. a locale no longer offered) and the callbacks that react to an email change, so the one
# callback that matters, clearing the bounce that belonged to the old `email`, is done by hand.
#
#     rake single_use:move_unconfirmed_emails_of_sso_users_to_new_email                     # dry run, all tenants
#     rake 'single_use:move_unconfirmed_emails_of_sso_users_to_new_email[execute]'          # write, all tenants
#     rake 'single_use:move_unconfirmed_emails_of_sso_users_to_new_email[execute,foo.com]'  # write, one tenant
namespace :single_use do
  desc "Move the unconfirmed email of users with an identity to new_email. Dry run unless passed 'execute'."
  task :move_unconfirmed_emails_of_sso_users_to_new_email, %i[execute host] => [:environment] do |_t, args|
    outcomes = Hash.new(0)

    TenantScript.run(
      'move_unconfirmed_emails_of_sso_users_to_new_email',
      args: args,
      description: 'moving the unconfirmed email of users with an identity to new_email',
      summary: ->(_script) { outcomes.each { |outcome, count| puts "     #{outcome}: #{count}" } }
    ) do |tenant, script|
      users = User
        .not_invited
        .where(confirmation_required: true, email_confirmed_at: nil)
        .where.not(email: nil)
        .where(id: Identity.select(:user_id))

      users.find_each do |user|
        pending_elsewhere = user.new_email.present? || user.merge_target_email.present?
        outcome = if !pending_elsewhere
          'moved_to_new_email'
        elsif user.new_email.present? && user.new_email.casecmp?(user.email)
          'cleared_already_in_new_email'
        elsif user.new_email.present?
          'cleared_other_new_email_kept'
        else
          'cleared_merge_target_email_kept'
        end
        outcomes[outcome] += 1

        context = {
          tenant: tenant.host,
          user_id: user.id,
          outcome: outcome,
          # A password holder in this state is deleted by prevent_user_account_hijacking on their
          # next SSO sign-in, with or without this task. Flagged so they can be looked at.
          has_password: user.password_digest.present?,
          has_roles: user.roles.present?
        }
        # Only an address this task drops goes in the report; a moved one is still on the user.
        context[:dropped_email] = user.email if pending_elsewhere && outcome != 'cleared_already_in_new_email'

        script.reporter.add_change(
          { email: 'present', new_email: user.new_email.present? ? 'present' : nil },
          { email: nil, new_email: 'present' },
          context: context
        )
        next unless script.execute?

        User.transaction do
          user.update_columns(
            email: nil,
            new_email: pending_elsewhere ? user.new_email : user.email,
            email_bounced_at: nil,
            email_bounce_reason: nil,
            updated_at: Time.zone.now
          )
          # Its code could only confirm the address that just left `email`.
          user.email_confirmation&.destroy!
        end
      end
    end
  end
end

# frozen_string_literal: true

# A confirmation row exists only to carry one code. It is created lazily when a code is issued and,
# since Confirmation#consume!, deleted again the moment the code has done its job. Before that the
# row was only emptied, so every account that ever confirmed an email or a phone number still owns
# a row standing for nothing. This sweeps those up.
#
# A row goes only when both halves agree that its cycle is over: its code is gone, and the user's
# own state says the flow no longer has to happen (the question User#confirmation_pending? answers,
# asked of many rows at once). Either half alone would be unsafe. A user re-confirming an email
# whose confirmed_email_expiry has elapsed reads as "not pending" while holding a code they are
# about to type, and a row created a moment ago has no code yet.
#
# Run it after the deploy that introduced consume!, so that no new rows are being left behind while
# it works. A code request that races the sweep loses the row it was about to write its code to,
# and the user has to ask for a second code; the window is the few milliseconds between creating a
# row and issuing its code.
#
#     rake single_use:delete_used_confirmations                     # dry run, all tenants
#     rake 'single_use:delete_used_confirmations[execute]'          # delete, all tenants
#     rake 'single_use:delete_used_confirmations[execute,foo.com]'  # delete, one tenant
namespace :single_use do
  desc "Delete confirmations whose code has already been used. Dry run unless passed 'execute'."
  task :delete_used_confirmations, %i[execute host] => [:environment] do |_t, args|
    finished_flows = {
      EmailConfirmation => -> { User.where(confirmation_required: false) },
      NewEmailConfirmation => -> { User.where(new_email: nil) },
      PhoneConfirmation => -> { User.where.not(phone_confirmed_at: nil) },
      NewPhoneConfirmation => -> { User.where(new_phone: nil) }
    }
    rows_per_type = Hash.new(0)

    TenantScript.run(
      'delete_used_confirmations',
      args: args,
      description: 'deleting confirmations whose code has already been used',
      # The reporter counts one entry per tenant and type, so the rows themselves need saying.
      summary: lambda { |script|
        # rubocop:disable Rails/Output
        puts "   Rows: #{rows_per_type.values.sum}#{script.execute? ? '' : ' (not deleted — dry run)'}"
        rows_per_type.each { |type, rows| puts "     #{type}: #{rows}" }
        # rubocop:enable Rails/Output
      }
    ) do |tenant, script|
      finished_flows.each do |confirmation_class, finished_users|
        used = confirmation_class.where(code: nil, user_id: finished_users.call.select(:id))
        rows = used.count
        next if rows.zero?

        rows_per_type[confirmation_class.name] += rows
        script.reporter.add_delete(
          confirmation_class.name,
          "#{rows} rows",
          context: { tenant: tenant.host }
        )
        used.delete_all if script.execute?
      end
    end
  end
end

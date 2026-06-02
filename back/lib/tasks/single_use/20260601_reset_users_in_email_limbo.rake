# Context:
# There are currently users in the database with the following properties:
# - They have an email address
# - This email address is not confirmed
# - They do not have a new_email
# - They have more than 0 identities (bc of SSO / verification flows)
# This currently puts them in a limbo state where they cannot do anything
# (because they are seen as confirmation_required?)
# and they also cannot request a code (because the flow expects the new_email
# field to be set in this situation, not the normal email field).
# This task copies the unconfirmed email to the new_email field,
# so that users can request a code and confirm their new email.
# BTW, this limbo situation should not be possible anymore.
# So hopefully we will only have to run this once
namespace :single_use do
  desc 'Users with email + > 0 identities + no email confirmed: reset email field'
  task :reset_users_in_email_limbo, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Reset users in email limbo ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    Tenant.safe_switch_each do |tenant|
      # Select users in limbo state
      users_in_limbo = User
        .where.not(email: nil)
        .where(confirmation_required: true)
        .where(new_email: nil)
        .where(id: Identity.select(:user_id))

      puts "Tenant: #{tenant.name} - Found #{users_in_limbo.count} users in email limbo"

      if execute
        users_in_limbo.update_all('new_email = email')
        puts "Tenant: #{tenant.name} - Updated #{users_in_limbo.count} users in email limbo (email copied to new_email)"
      end
    end
  end
end
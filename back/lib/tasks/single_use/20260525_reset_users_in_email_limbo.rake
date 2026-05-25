# Context:
# There are currently users in the database with the following properties:
# - They have an email address
# - They have more than 0 identities (bc of SSO / verification flows)
# - They have no confirmed email address
# This currently puts them in a limbo state where they cannot do anything
# (because they are seen as confirmation_required?)
# and they also cannot request a code (because the flow expects the new_email 
# field to be set in this situation, not the normal email field).
# This task reset the email field so that users can do things again (as
# confirmation_required? will be false). If they want to add an email, they
# can also do so through the correct new_email flow.
namespace :single_use do
  desc 'Users with email + > 0 identities + no email confirmed: reset email field'
  task :reset_users_in_email_limbo, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    
  end
end

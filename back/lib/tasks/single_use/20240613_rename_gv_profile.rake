namespace :gv_transition do
  desc 'Replace the Citizenlab default moderator with Go Vocal attributes.'
  task :rename_profile, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      default_moderators = User.where(email: %w[moderator@citizenlab.co moderator@govocal.com])
      default_moderators.each do |moderator|
        if moderator.first_name&.downcase == 'citizenlab'
          old_v = moderator.first_name
          new_v = 'Go Vocal'
          moderator.first_name = new_v
          moderator.remote_avatar_url = 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/gv_admin_avatar.png'
          if moderator.save
            reporter.add_change(
              old_v,
              new_v,
              context: { tenant: tenant.host, user: moderator.id }
            )
          else
            reporter.add_error(
              moderator.errors.details,
              context: { tenant: tenant.host, user: moderator.id }
            )
          end
        end
      end
    end
    reporter.report!('rename_gv_profile_report.json', verbose: true)
  end
end

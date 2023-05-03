# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Set all moderators and admins to confirmed'
  task :confirm_moderators, [:dry_run] => [:environment] do |_t, args|
    dry_run = args[:dry_run] != 'false'
    puts "Dry run: #{dry_run}"
    Tenant.creation_finalized.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      tenant.switch do
        User.not_normal_user.each do |user|
          next if !UserRoleService.new.moderates_something?(user)

          if dry_run
            puts "Confirming #{user.email} - #{user.roles}"
          else
            user.confirm
            user.save!
          end
        end
      end
    end
  end
end

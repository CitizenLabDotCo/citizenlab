# frozen_string_literal: true

# WARNING! Also deletes associated users with invite_status: 'pending'!

namespace :cl2_back do
  desc 'Delete invites that are older than specified number of days'
  task delete_expired_invites: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        puts "Deleting expired invites from tenant #{tenant.host}..."

        Invite.all.each do |invite|
          if invite.created_at < 30.seconds.ago
            DeleteInviteJob.perform_now(invite)
          end
        end
      end
    end
  end
end

# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Identify all users of all tenants'
  task identify_all: [:environment] do |_t, _args|
    Tenant.not_deleted.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        User.all.each do |user|
          TrackUserJob.perform_later(user)
        end
      end
    end
  end

  desc 'Identify one user per tenant'
  task identify_one: [:environment] do |_t, _args|
    Tenant.not_deleted.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        user = User.admin.first
        user ||= User.first
        TrackUserJob.perform_later(user) if user
      end
    end
  end
end

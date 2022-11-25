# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Migrates finalized_at.'
  task :migrate_creation_finalized_at, [] => [:environment] do
    Activity.where(action: 'template_loaded', item_type: 'Tenant').each do |activity|
      tenant = activity.item
      if tenant && !tenant.deleted_at
        tenant.creation_finalized_at ||= activity.acted_at
        tenant.save!
      end
    end
    Tenant.not_deleted.where('created_at < ?', Time.zone.parse('01-01-2021')).each do |tenant|
      tenant.creation_finalized_at ||= tenant.created_at
      tenant.save!
    end
  end
end

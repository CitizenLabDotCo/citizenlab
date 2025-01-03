# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Add the missing permissions.'
  task update_permissions: [:environment] do |_t, _args|
    Rails.logger.info 'fix_existing_tenants:update_permissions started'
    Tenant.creation_finalized.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Permissions::PermissionsUpdateService.new.update_all_permissions
      end
    end
    Rails.logger.info 'fix_existing_tenants:update_permissions finished'
  end

  desc 'Migrate changes in action names'
  task migrate_action_names: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Permission.where(action: 'posting').update_all action: 'posting_idea'
        Permission.where(action: 'reacting').update_all action: 'reacting_idea'
        Permission.where(action: 'commenting').update_all action: 'commenting_idea'
      end
    end
  end

  desc 'Add the missing global permissions.'
  task update_global_permissions: [:environment] do |_t, _args|
    Tenant.creation_finalized.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PermissionsUpdateService.new.update_global_permissions
      end
    end
  end

  desc "Migrate permitted by's after introducing users value"
  task migrate_permitted_bies: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Permission.where(permitted_by: 'everyone').where.not(action: 'taking_survey').update_all permitted_by: 'users'
      end
    end
  end
end

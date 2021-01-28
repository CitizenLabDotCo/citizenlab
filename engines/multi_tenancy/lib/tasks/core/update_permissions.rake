namespace :fix_existing_tenants do
  desc "Add the missing permissions."
  task :update_permissions => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PermissionsService.new.update_all_permissions
      end
    end
  end

  desc "Migrate changes in action names"
  task :migrate_action_names => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Permission.where(action: 'posting').update_all action: 'posting_idea'
        Permission.where(action: 'voting').update_all action: 'voting_idea'
        Permission.where(action: 'commenting').update_all action: 'commenting_idea'
      end
    end
  end

  desc "Add the missing global permissions."
  task :update_global_permissions => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PermissionsService.new.update_global_permissions
      end
    end
  end

  desc "Migrate permitted by's after introducing users value"
  task :migrate_permitted_bies => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Permission.where(permitted_by: 'everyone').where.not(action: 'taking_survey').update_all permitted_by: 'users'
      end
    end
  end

  desc "Migrate initiatives posting_enabled before removal"
  task :migrate_initiatives_posting_enabled => [:environment] do |t, args|
    Tenant.all.select do |tenant|
      tenant.settings.dig('initiatives', 'posting_enabled') == false
    end.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Permission.where(action: 'posting_initiative').update_all permitted_by: 'admins_moderators'
      end
    end
  end
end
namespace :analytics do
  desc 'Delete dimension types related to initiatives'
  task :delete_initiative_dimension_types, [] => [:environment] do
    Tenant.safe_switch_each do
      Analytics::DimensionType.where(name: 'initiative').each(&:destroy!)
      Analytics::DimensionType.where(parent: 'initiative').each(&:destroy!)
    end
  end
end

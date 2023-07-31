# frozen_string_literal: true

# NOTE: Only to be used for release that migrates Votes -> Reactions
namespace :fix_existing_tenants do
  desc 'Transform all budgeted_in smart groups to voted_in'
  task migrate_budgeting_smart_groups: [:environment] do |_t, _args|
    # In priority order - active first
    tenants = Tenant.creation_finalized.with_lifecycle('active') +
              Tenant.creation_finalized.with_lifecycle('trial') +
              Tenant.creation_finalized.with_lifecycle('demo') +
              Tenant.creation_finalized.with_lifecycle('expired_trial') +
              Tenant.creation_finalized.with_lifecycle('churned') +
              Tenant.creation_finalized.with_lifecycle('not_applicable')
    budgeting_migrator = BudgetingToVotesMigrator.new
    tenants.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        budgeting_migrator.run(tenant)
      end
    end
    budgeting_migrator.output_errors
  end
end

class BudgetingToVotesMigrator
  def initialize
    @errors = {}
  end

  def run(tenant)
    @tenant = tenant
    Rails.logger.info "Processing data for tenant #{@tenant.host}"
    update_smart_groups
  end

  def output_errors
    Rails.logger.info 'COMPLETE'
    errors_count = 0
    @errors.each do |host, errors|
      errors.each do |error|
        Rails.logger.error "ERROR: [#{host}] #{error}"
        errors_count += 1
      end
    end
    Rails.logger.info 'NO ERRORS FOUND' if errors_count == 0
  end

  private

  def update_smart_groups
    Rails.logger.info "UPDATING: Smart groups for #{@tenant.host}"
    count = 0
    Group.where(membership_type: 'rules').each do |group|
      next unless group.rules.to_s.include? 'budgeted'

      group.rules.each do |rule|
        rule['predicate'].sub!('budgeted', 'voted')
      end
      if group.save
        count += 1
      else
        error_handler "SMART_GROUP_ERROR: #{group.errors.errors}"
      end
    end
    Rails.logger.info "SAVED: #{count} groups"
  end

  def error_handler(error)
    Rails.logger.error "ERROR: #{error}"
    @errors[@tenant.host] << error
  end
end

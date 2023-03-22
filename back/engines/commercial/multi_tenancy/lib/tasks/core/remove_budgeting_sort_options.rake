# frozen_string_literal: true

# to persist changes run: fix_existing_tenants:remove_budgeting_sort_options[true]
# to persist changes for one host run: fix_existing_tenants:remove_budgeting_sort_options[true,localhost]
namespace :fix_existing_tenants do
  desc 'Migrate ideation form custom fields to the new codes and types'
  task :remove_budgeting_sort_options, %i[persist_changes specify_host] => [:environment] do |_t, args|
    persist_changes = args[:persist_changes] == 'true'
    specify_host = args[:specify_host]
    Rails.logger.info 'DRY RUN: Changes will not be persisted' unless persist_changes
    stats = {}
    Tenant.creation_finalized.each do |tenant|
      next unless tenant.host == specify_host || specify_host.blank?

      Rails.logger.info "PROCESSING TENANT: #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        order_remover = OrderUpdater.new
        order_remover.update(persist_changes)
        stats[tenant.host] = order_remover.stats
      end
    end

    stats.each do |host, stat|
      Rails.logger.info "STATS: #{host} - projects: #{stat[:projects]}, phases: #{stat[:phases]}, updated: #{stat[:updates]}"
      stat[:errors]&.each do |error|
        Rails.logger.info "ERROR: #{error}"
      end
    end
  end
end

class OrderUpdater
  def initialize
    @stats = { projects: 0, phases: 0, updates: 0 }
    @errors = []
  end

  attr_reader :stats

  def update(persist_changes)
    update_contexts(:projects, Project.where(participation_method: 'budgeting', ideas_order: %w[popular trending]), persist_changes)
    update_contexts(:phases, Phase.where(participation_method: 'budgeting', ideas_order: %w[popular trending]), persist_changes)
  end

  def update_contexts(type, contexts, persist_changes)
    contexts&.each do |context|
      Rails.logger.info "UPDATING VALUE FROM #{context.ideas_order} TO 'random'"
      @stats[type] += 1
      if persist_changes
        @stats[:updates] += 1
        if !context.update(ideas_order: 'random') && !context.save
          error_handler "Cannot update ideas_order: #{context.errors.errors}"
        end
      end
    end
  end

  def error_handler(error)
    Rails.logger.error "ERROR: #{error}"
    @stats[:errors] << error
  end
end

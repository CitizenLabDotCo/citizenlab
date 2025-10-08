# frozen_string_literal: true

require_relative '../../accordion_structure_repair'

namespace :single_use do
  desc 'Repair broken accordion migrations by fixing node structure and linking'

  task repair_broken_accordions: :environment do
    dry_run = ENV['DRY_RUN']&.downcase == 'true'
    target_tenant = ENV['TARGET_TENANT'] # Optional: can target a specific tenant

    repair = AccordionStructureRepair.new(dry_run: dry_run)
    repair.run(target_tenant)
  end
end
# frozen_string_literal: true

require_relative 'services/consolidated_inputs_repairer'

# Cape Town merged its old Staff and Resident ideas phases into one new phase per audience by
# importing the inputs (TAN-9037). The import attached each copy to a placeholder user instead of
# its real author, and left the images, follows and comments behind. This puts each of them back
# from the old input onto its imported copy, deletes the placeholder users, and notifies nobody.
# See ConsolidatedInputsRepairer for how copies are matched to their source.
#
#     rake 'single_use:repair_consolidated_inputs[,capetown.govocal.com]'         # dry run
#     rake 'single_use:repair_consolidated_inputs[execute,capetown.govocal.com]'  # write
namespace :single_use do
  desc "Repair the inputs Cape Town copied by import from its old ideas phases. Dry run unless passed 'execute'."
  task :repair_consolidated_inputs, %i[execute host] => [:environment] do |_t, args|
    host = 'capetown.govocal.com'
    map = {
      # cct-staff-ideas <= the 2 old staff phases
      'f20eb80d-d4b6-4b44-8ce1-267e12cb2cc1' => %w[d8760473-24aa-4cac-ae12-3534813263e5 e8090f51-2135-4497-a5d2-f297c55de6a4],
      # resident-ideas <= the 3 old resident phases
      'af1c95a2-9122-4309-b54e-a9b0efcc5dd6' => %w[9e8a2ed6-cad8-4303-a64f-c503a6f183dd 7a995438-96f9-4277-a946-3f3c9a312bc8 8522bd0b-ea17-4780-95aa-a9eb17273aa3]
    }
    counts = Hash.new(0)
    follow_activated = nil

    # rubocop:disable Rails/Output
    summary = lambda do |_script|
      puts "   Pairs matched: #{counts[:pairs]}, skipped: #{counts[:skipped]}"
      puts "   Authors fixed: #{counts[:authors_fixed]}, made anonymous: #{counts[:made_anonymous]}"
      puts "   Placeholder users deleted: #{counts[:ghosts_deleted]}, kept: #{counts[:ghosts_kept]}"
      puts "   Author likes: #{counts[:author_reactions]}, follows: #{counts[:followers]}"
      puts "   Images: #{counts[:images]}, not copied: #{counts[:images_failed]}"
      puts "   Comments: #{counts[:comments]}, comment reactions: #{counts[:reactions]}"
      # Follows only lead to notifications when the feature is on.
      puts "   'follow' feature activated: #{follow_activated.inspect}"
    end
    # rubocop:enable Rails/Output

    TenantScript.run(
      'repair_consolidated_inputs',
      args: args,
      description: 'repairing the inputs copied by import from old phases',
      tenants: Tenant.where(host: host),
      summary: summary
    ) do |_tenant, script|
      follow_activated = AppConfiguration.instance.feature_activated?('follow')
      repairer = Tasks::SingleUse::Services::ConsolidatedInputsRepairer.new(map, reporter: script.reporter, execute: script.execute?)
      counts = repairer.run
    end
  end
end

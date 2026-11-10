# frozen_string_literal: true

require_relative 'services/consolidated_inputs_comment_copier'

# Cape Town merged its old Staff and Resident ideas phases into one new phase per audience by
# importing the inputs, which left their comments behind (TAN-9037). This copies the comments,
# replies and comment likes/dislikes of each old input onto its imported copy, without notifying
# anyone. See ConsolidatedInputsCommentCopier for how copies are matched to their source.
#
#     rake 'single_use:copy_comments_to_consolidated_inputs[,capetown.govocal.com]'         # dry run
#     rake 'single_use:copy_comments_to_consolidated_inputs[execute,capetown.govocal.com]'  # write
namespace :single_use do
  desc "Copy the comments of Cape Town's old ideas onto their imported copies. Dry run unless passed 'execute'."
  task :copy_comments_to_consolidated_inputs, %i[execute host] => [:environment] do |_t, args|
    host = 'capetown.govocal.com'
    map = {
      # cct-staff-ideas <= the 2 old staff phases
      'f20eb80d-d4b6-4b44-8ce1-267e12cb2cc1' => %w[d8760473-24aa-4cac-ae12-3534813263e5 e8090f51-2135-4497-a5d2-f297c55de6a4],
      # resident-ideas <= the 3 old resident phases
      'af1c95a2-9122-4309-b54e-a9b0efcc5dd6' => %w[9e8a2ed6-cad8-4303-a64f-c503a6f183dd 7a995438-96f9-4277-a946-3f3c9a312bc8 8522bd0b-ea17-4780-95aa-a9eb17273aa3]
    }
    counts = Hash.new(0)

    TenantScript.run(
      'copy_comments_to_consolidated_inputs',
      args: args,
      description: 'copying the comments of old inputs onto their imported copies',
      tenants: Tenant.where(host: host),
      summary: ->(_script) { puts "   Pairs matched: #{counts[:pairs]}, skipped: #{counts[:skipped]}, comments: #{counts[:comments]}, reactions: #{counts[:reactions]}" }
    ) do |_tenant, script|
      copier = Tasks::SingleUse::Services::ConsolidatedInputsCommentCopier.new(map, reporter: script.reporter, execute: script.execute?)
      counts = copier.run
    end
  end
end

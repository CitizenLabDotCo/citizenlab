# frozen_string_literal: true

# Task to remove excess email campaign examples over a given limit (via an argument) of n examples per campaign.
#
# The oldest examples are removed first.
# The task can be run in dry run mode (no changes) or execute mode (destroys records).
# The task is run for all email campaigns and for all tenants.
#
# Useful when the EXAMPLES_PER_CAMPAIGN value has been decreased in the email_campaigns/examples_service.rb file,
# and you want to remove the excess examples that were created before the change.
# Also useful if a bug has caused too many examples to be created, and you want to remove the excess examples,
# though this should resolve over time, as the ExamplesService also prunes old examples when campaigns are sent.
# Also useful in dry_run mode to see how many excess examples there are per campaign.

namespace :cl2_back do
  desc 'Destroy excess email campaigns examples'
  # Usage:
  # Dry run (no changes): rake cl2_back:destroy_excess_examples['3']
  # Execute (destroys records!): rake cl2_back:destroy_excess_examples['3','execute']
  task :destroy_excess_examples, %i[limit execute] => [:environment] do |_t, args|
    args.with_defaults(execute: false)

    dry_run = args[:execute] != 'execute'
    limit = if args[:limit].to_i.positive?
      args[:limit].to_i
    else
      abort("Aborted! Failed to parse a positive integer from the 'limit' argument")
    end

    puts "Destroying excess email campaign examples (dry run: #{dry_run})"
    puts "Using the provided limit of #{limit} examples per campaign"

    Tenant.all.each_with_index do |tenant, i|
      puts "#{i + 1} / #{Tenant.count}: #{tenant.name}"
      tenant.switch do
        EmailCampaigns::Campaign.all.each do |campaign|
          examples = EmailCampaigns::Example.where(campaign: campaign)
          next if examples.count <= limit

          puts "  #{campaign.class.name} (#{campaign.id}): #{examples.count} examples (#{examples.count - limit} excess)"
          next if dry_run

          valid_examples = examples
            .order(created_at: :desc)
            .limit(limit)

          examples.where.not(id: valid_examples).destroy_all

          print '... destroyed excess examples.'
        end
      end
    end
  end
end

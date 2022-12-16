# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix the counts for all existing tenants.'
  task fix_counters: [:environment] do |_t, _args|
    fixes = []
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        puts "Processing tenant #{tenant.host}..."

        fixes += Idea.counter_culture_fix_counts(skip_unsupported: true).map do |fix|
          fix[:tenant] = tenant.host
          fix
        end
        fixes += IdeasPhase.counter_culture_fix_counts(skip_unsupported: true).map do |fix|
          fix[:tenant] = tenant.host
          fix
        end
        fixes += Comment.counter_culture_fix_counts(skip_unsupported: true).map do |fix|
          fix[:tenant] = tenant.host
          fix
        end
        fixes += OfficialFeedback.counter_culture_fix_counts(skip_unsupported: true).map do |fix|
          fix[:tenant] = tenant.host
          fix
        end
        fixes += Membership.counter_culture_fix_counts(skip_unsupported: true).map do |fix|
          fix[:tenant] = tenant.host
          fix
        end
        fixes += Vote.counter_culture_fix_counts(skip_unsupported: true).map do |fix|
          fix[:tenant] = tenant.host
          fix
        end
        fixes += EmailCampaigns::Delivery.counter_culture_fix_counts(skip_unsupported: true).map do |fix|
          fix[:tenant] = tenant.host
          fix
        end
        fixes += Volunteering::Volunteer.counter_culture_fix_counts(skip_unsupported: true).map do |fix|
          fix[:tenant] = tenant.host
          fix
        end
      end
    end

    puts "#{fixes.size} counters fixed:"
    fixes.each do |fix|
      puts "  changed #{fix[:what]} of #{fix[:entity]} #{fix[:id]} from #{fix[:wrong]} to #{fix[:right]} in #{fix[:tenant]}"
    end
  end

  task fix_membership_counters: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        UpdateMemberCountJob.perform_later
      end
    end
  end
end

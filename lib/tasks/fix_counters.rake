
namespace :fix_existing_tenants do
  desc "Fix the counts for all existing tenants."
  task :fix_counters => [:environment] do |t, args|
    fixes = []
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        puts "Processing tenant #{tenant.host}..."

        fixes += Idea.counter_culture_fix_counts(skip_unsupported: true).map{|fix| fix[:tenant] = tenant.host; fix}
        fixes += IdeasPhase.counter_culture_fix_counts(skip_unsupported: true).map{|fix| fix[:tenant] = tenant.host; fix}
        fixes += Comment.counter_culture_fix_counts(skip_unsupported: true).map{|fix| fix[:tenant] = tenant.host; fix}
        fixes += OfficialFeedback.counter_culture_fix_counts(skip_unsupported: true).map{|fix| fix[:tenant] = tenant.host; fix}
        fixes += Membership.counter_culture_fix_counts(skip_unsupported: true).map{|fix| fix[:tenant] = tenant.host; fix}
        fixes += Vote.counter_culture_fix_counts(skip_unsupported: true).map{|fix| fix[:tenant] = tenant.host; fix}
        fixes += EmailCampaigns::Delivery.counter_culture_fix_counts(skip_unsupported: true).map{|fix| fix[:tenant] = tenant.host; fix}
        fixes += Volunteering::Volunteer.counter_culture_fix_counts(skip_unsupported: true).map{|fix| fix[:tenant] = tenant.host; fix}
      end
    end

    puts "#{fixes.size} counters fixed:"
    fixes.each do |fix|
      puts "  changed #{fix[:what]} of #{fix[:entity]} #{fix[:id]} from #{fix[:wrong]} to #{fix[:right]} in #{fix[:tenant]}"
    end
  end

  task :fix_membership_counters => [:environment] do |t, args|
    fixes = []
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do

        UpdateMemberCountJob.perform_later

      end
    end
  end
end

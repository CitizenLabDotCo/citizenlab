# frozen_string_literal: true

namespace :migrate_toxicity do
  desc 'Migrated inappropriate content flags to the new toxicity labels'
  task :toxicity_labels, %i[host] => [:environment] do |_t, args|
    tenants = if args[:host]
      Tenant.where(host: args[:host])
    else
      Tenant.prioritize(Tenant.creation_finalized)
    end
    tenants.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Rails.logger.info tenant.host

        FlagInappropriateContent::InappropriateContentFlag.where(toxicity_label: 'obscene').update_all toxicity_label: 'sexually_explicit'
        FlagInappropriateContent::InappropriateContentFlag.where.not(toxicity_label: ['insult', 'harmful', 'sexually_explicit', 'spam', nil]).update_all toxicity_label: 'insult'
      end
    end
  end
end

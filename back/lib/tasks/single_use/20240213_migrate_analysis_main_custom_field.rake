# frozen_string_literal: true

namespace :migrate_analysis do
  desc 'Fix existing homepage'
  task :main_custom_fields, %i[host] => [:environment] do |_t, args|
    errors = {}
    tenants = if args[:host]
      Tenant.where(host: args[:host])
    else
      Tenant.prioritize(Tenant.creation_finalized)
    end
    tenants.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Rails.logger.info tenant.host

        Analysis::Analysis.all.each do |analysis|
          next if analysis.main_custom_field.present? # Make idempotent

          if analysis.analyses_additional_custom_fields.count < 1 || analysis.additional_custom_fields.count < 1
            errors[tenant.host] ||= {}
            errors[tenant.host][analysis.id] = 'No associated custom fields'
            next
          end

          main_field = analysis.additional_custom_fields.find_by(code: 'body_multiloc') || analysis.analyses_additional_custom_fields.order(:created_at).filter(&:support_free_text_value?).first.custom_field # TODO: first created association or first in ordering?
          if main_field.blank?
            errors[tenant.host] ||= {}
            errors[tenant.host][analysis.id] = 'No main custom field found'
            next
          end

          if !analysis.update(main_custom_field: main_field)
            errors[tenant.host] ||= {}
            errors[tenant.host][analysis.id] = analysis.errors.full_messages
            next
          end

          if !analysis.analyses_additional_custom_fields.find_by(custom_field: main_field).destroy
            errors[tenant.host] ||= {}
            errors[tenant.host][analysis.id] = 'Could not remove main field from additional fields'
            next
          end
        end
      end
    end

    if errors.present?
      Rails.logger.info 'Some errors occurred!'
      pp errors
    else
      Rails.logger.info 'Success!'
    end
  end
end

# frozen_string_literal: true

namespace :migrate_analysis do
  desc 'Extract the main custom field from the additional fields'
  task :main_custom_fields, %i[host] => [:environment] do |_t, args|
    errors = {}
    no_main_field = {}
    tenants = if args[:host]
      Tenant.where(host: args[:host])
    else
      Tenant.prioritize(Tenant.creation_finalized)
    end
    tenants.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Rails.logger.info tenant.host

        main_field_ids = Analysis::Analysis.pluck(:main_custom_field_id).compact
        Analysis::Analysis.all.each do |analysis|
          next if analysis.main_custom_field.present? # Make idempotent
          next if analysis.participation_method == 'ideation'

          if analysis.associated_custom_fields.count < 1
            if !analysis.destroy
              errors[tenant.host] ||= {}
              errors[tenant.host][analysis.id] = analysis.errors.full_messages
            end
            next
          end

          main_field = analysis
            .analyses_additional_custom_fields
            .where.not(custom_field_id: main_field_ids)
            .order(:created_at)
            .includes(:custom_field)
            .map(&:custom_field)
            .find(&:supports_free_text_value?)
          if !main_field
            no_main_field[tenant.host] ||= []
            no_main_field[tenant.host] << analysis.id
            next
          end

          main_field_ids << main_field.id

          if !analysis.analyses_additional_custom_fields.find_by(custom_field: main_field).destroy
            errors[tenant.host] ||= {}
            errors[tenant.host][analysis.id] = 'Could not remove main field from additional fields'
            next
          end
          analysis.reload

          if !analysis.update(main_custom_field: main_field)
            errors[tenant.host] ||= {}
            errors[tenant.host][analysis.id] = analysis.errors.full_messages
            next
          end
        end
      end
    end

    Rails.logger.info "No main field: #{no_main_field}" if no_main_field.present?

    if errors.present?
      Rails.logger.info 'Some errors occurred!'
      pp errors
    else
      Rails.logger.info 'Success!'
    end
  end
end

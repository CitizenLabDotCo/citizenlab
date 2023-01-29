# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc "Creates a page at the top of each survey form that doesn't have a page at the top"
  task ensure_page_at_top: [:environment] do |_t, _args|
    Tenant.creation_finalized.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      tenant.switch do
        pc_ids = Project.where(participation_method: 'native_survey').ids + Phase.where(participation_method: 'native_survey').ids
        CustomForm.where(participation_context_id: pc_ids).each do |form|
          next if form.custom_fields.empty? || form.custom_fields.first.page?

          puts "  Adding first page to form #{form.id}"
          CustomField.create!(
            resource_type: 'CustomForm',
            resource_id: form.id,
            input_type: 'page',
            key: 'migrated_page_key'
          ).move_to_top
        end
      end
    end
  end
end

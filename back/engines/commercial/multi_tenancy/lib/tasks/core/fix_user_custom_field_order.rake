# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix user custom field ordering to be sequential when the ordering has messed up'
  task fix_user_custom_field_order: [:environment] do |_t, _args|
    Tenant.creation_finalized.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Rails.logger.info "Attempting to reorder: #{tenant.name}"
        fields = CustomField.registration.order(:ordering)
        if fields.pluck(:ordering) != (0..fields.size - 1).to_a
          fields.each_with_index do |field, index|
            field.set_list_position(index)
          end
          Rails.logger.info "Fixed: #{tenant.name}"
        end
      end
    end
  end
end

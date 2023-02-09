# frozen_string_literal: true

# to persist changes run: fix_existing_tenants:migrate_flexible_input_forms[true]
# to persist changes for one host run: fix_existing_tenants:migrate_flexible_input_forms[true,localhost]
namespace :fix_existing_tenants do
  desc 'Migrate ideation form custom fields to the new codes and types'
  task :migrate_flexible_input_forms, %i[persist_changes specify_host] => [:environment] do |_t, args|
    persist_changes = args[:persist_changes] == 'true'
    specify_host = args[:specify_host]
    Rails.logger.info 'DRY RUN: Changes will not be persisted' unless persist_changes
    stats = {}
    Tenant.creation_finalized.each do |tenant|
      next unless tenant.host == specify_host || specify_host.blank?

      Rails.logger.info "PROCESSING TENANT: #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        form_migrator = FlexibleInputFormMigrator.new
        CustomForm.all.each do |custom_form|
          form_migrator.migrate_form(custom_form, persist_changes)
        end
        stats[tenant.host] = form_migrator.stats
      end
    end

    stats.each do |host, stat|
      Rails.logger.info "STATS: #{host} - forms:#{stat[:forms]}(#{stat[:empty]}) update:#{stat[:updated]} create:#{stat[:created]}"
      stat[:errors].each do |error|
        Rails.logger.info "ERROR: #{error}"
      end
    end
  end
end

class FlexibleInputFormMigrator
  def initialize
    @stats = { forms: 0, empty: 0, updated: 0, created: 0, errors: [] }
    @errors = []
  end

  attr_reader :stats

  def migrate_form(custom_form, persist_changes)
    @stats[:forms] += 1

    # Get persisted fields by order
    fields = custom_form.custom_fields.order(:ordering)

    # Do nothing if there are no fields (can this happen?)
    if fields.empty?
      Rails.logger.info 'NO FIELDS: No currently persisted fields'
      @stats[:empty] += 1
      return
    end

    # Format the fields
    Rails.logger.info "ORDERING: #{custom_form.id}"
    if custom_form.participation_context.participation_method == 'native_survey'
      fix_ordering(fields) # Only fix ordering in survey forms
    else
      fields = merge_ideation_fields fields, custom_form
    end

    # Validate that sections / pages are present
    errors = {}
    IdeaCustomFieldsService.new(custom_form).check_form_structure fields, errors
    if errors.present?
      error_handler "Form structure does not validate #{errors}"
      return
    end

    # Validate that the ordering is correct
    ordering = fields.pluck('ordering')
    if ordering[0] != 0 || !ordering.each_cons(2).all? { |x, y| y == x + 1 }
      error_handler "Ordering is not correct - #{ordering}"
      return
    end

    # Save the changes
    fields.each do |field|
      field_id = field.code || field.key
      field_order = field.ordering
      if field.persisted?
        if field.changed?
          Rails.logger.info "FIELD EXISTS - UPDATING: #{field_id} #{field.changes.keys}"
          if persist_changes
            if field.save
              field.insert_at(field_order)
            else
              error_handler "Cannot update field - #{field_id} - #{field.id} - #{field.errors.errors}"
            end
          end
          @stats[:updated] += 1
        else
          Rails.logger.info "FIELD EXISTS - NO CHANGES: #{field_id}"
        end
      else
        Rails.logger.info "NEW FIELD - CREATING: #{field_id}"
        if persist_changes
          if field.save
            field.insert_at(field_order)
          else
            error_handler "Cannot create field - #{field_id} - #{field.id} - #{field.errors.errors}"
          end
        end
        @stats[:created] += 1
      end
    end
  end

  def error_handler(error)
    Rails.logger.error "ERROR: #{error}"
    @stats[:errors] << error
  end

  def merge_ideation_fields(fields, custom_form)
    participation_method = Factory.instance.participation_method_for custom_form.participation_context
    default_fields = participation_method.default_fields(custom_form)
    constraints = participation_method.constraints
    updated_fields = []

    # Merge existing fields with same code as defaults
    default_fields.each do |default_field|
      existing_field = fields.find { |field| field.code == default_field.code }
      updated_fields << if existing_field
        merge_attributes(existing_field, default_field, constraints)
      else
        default_field
      end
    end

    # Add any additional custom fields that don't match the defaults
    fields.each do |field|
      unless updated_fields.find { |f| f.id == field.id }
        updated_fields << field
      end
    end
    fix_ordering(updated_fields)

    updated_fields
  end

  # Fix ordering in the context of a form, not of the platform
  # Done here to trigger changed attribute, but acts_as_list.insert_at used to set later
  def fix_ordering(fields)
    order_before = fields.pluck('ordering')
    fields.each_with_index do |field, index|
      field.ordering = index
    end
    order_after = fields.pluck('ordering')
    if order_before == order_after
      Rails.logger.info 'ORDER: No change'
    else
      Rails.logger.info "ORDER CHANGED: #{order_before} > #{order_after}"
    end
  end

  def merge_attributes(existing_field, default_field, form_constraints)
    field_constraints = form_constraints[existing_field.code&.to_sym]
    if field_constraints
      field_constraints[:locks]&.keys&.each do |attribute|
        existing_field[attribute] = default_field[attribute]
      end
    end

    # Input type shouldn't ever be different from default, but just in case it is
    existing_field.input_type = default_field.input_type

    existing_field
  end
end

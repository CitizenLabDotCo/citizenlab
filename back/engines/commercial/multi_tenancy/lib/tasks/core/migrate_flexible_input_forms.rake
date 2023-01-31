# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Migrate ideation form custom fields to the new codes and types - to persist changes run with [persist]'
  task :migrate_flexible_input_forms, [:persist_changes] => [:environment] do |_t, args|
    persist_changes = args[:persist_changes] == 'persist'
    Rails.logger.info 'DRY RUN: Changes will not be persisted' unless persist_changes
    Tenant.all.each do |tenant|
      Rails.logger.info "PROCESSING TENANT: #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        if tenant.host == 'localhost' # temp
          form_migrator = FlexibleInputFormMigrator.new
          CustomForm.all.each do |custom_form|
            form_migrator.migrate_form(custom_form, persist_changes)
          end
          form_migrator.output_stats tenant.host
        end
      end
    end
  end
end

class FlexibleInputFormMigrator
  def initialize
    @stats = { forms: 0, errors: 0, updated: 0, created: 0 }
  end

  def output_stats(host)
    Rails.logger.info "STATS for #{host}: #{@stats}"
  end

  def migrate_form(custom_form, persist_changes)
    @stats[:forms] += 1

    # Format the fields
    fields = CustomField.where(resource: custom_form).order(:ordering)
    if custom_form.participation_context.participation_method == 'ideation'
      fields = merge_ideation_fields fields, custom_form
    else
      # Only fix ordering in other forms
      fix_ordering(fields)
    end

    # Validate that sections / pages are present
    errors = {}
    IdeaCustomFieldsService.new(custom_form).check_form_structure fields, errors
    if errors.present?
      Rails.logger.error "ERROR: Form structure does not validate #{errors}"
      @stats[:errors] += 1
      return
    end

    # Validate that the ordering is correct
    ordering = fields.pluck('ordering')
    if ordering[0] != 0 || !ordering.each_cons(2).all? { |x, y| y == x + 1 }
      Rails.logger.error "ERROR: Ordering is not correct - #{ordering}"
      @stats[:errors] += 1
      return
    end

    # Save the changes
    fields.each do |field|
      field_id = field.code || field.key
      if field.persisted?
        if field.changed?
          Rails.logger.info "FIELD EXISTS - UPDATING: #{field_id} #{field.changes.keys}"
          Rails.logger.info field.changes
          field.save! if persist_changes
          @stats[:updated] += 1
        else
          Rails.logger.info "FIELD EXISTS - NO CHANGES: #{field_id}"
        end
      else
        Rails.logger.info "NEW FIELD - CREATING: #{field_id}"
        field.save! if persist_changes
        @stats[:created] += 1
      end
    end
  end

  def merge_ideation_fields(fields, custom_form)
    participation_method = Factory.instance.participation_method_for custom_form.participation_context
    default_fields = participation_method.default_fields(custom_form)
    constraints = participation_method.constraints

    updated_fields = []
    default_fields.each do |default_field|
      existing_field = fields.find { |field| field.code == default_field.code }
      updated_fields << if existing_field
        merge_attributes(existing_field, default_field, constraints)
      else
        default_field
      end
    end
    fix_ordering(updated_fields)

    updated_fields
  end

  # Fix ordering in the context of a form, not of the platform
  def fix_ordering(fields)
    fields.each_with_index do |field, index|
      field.ordering = index
    end
  end

  def merge_attributes(existing_field, default_field, form_constraints)
    field_constraints = form_constraints[existing_field.code&.to_sym]
    if field_constraints
      field_constraints[:locks]&.keys.each do |attribute|
        existing_field[attribute] = default_field[attribute]
      end
    end

    # Input type shouldn't ever be different from default, but just in case it is
    existing_field.input_type = default_field.input_type

    existing_field
  end
end

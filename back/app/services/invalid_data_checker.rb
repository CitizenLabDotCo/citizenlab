# frozen_string_literal: true

class InvalidDataChecker
  SKIP_CLASSES = %w[
    EmailCampaigns::Delivery
    CommonPassword
    Analytics::FactVisit
  ].freeze

  def check_global(summary: nil)
    summary ||= initial_summary
    Cl2DataListingService.new.cl2_global_models.each do |claz|
      claz.all.find_each do |object|
        errors = validation_errors object
        add_errors_to_summary errors, claz.name, object.id, summary if errors
      end
    end

    summary
  end

  def check_tenant(tenant: nil, summary: nil)
    tenant ||= Tenant.current
    summary ||= initial_summary
    Apartment::Tenant.switch(tenant.schema_name) do
      schema_leaf_models = Cl2DataListingService.new.cl2_schema_leaf_models.reject do |claz|
        skip_class_for_inconsistent_data_checking? claz
      end
      schema_leaf_models.each do |claz|
        t1 = Time.zone.now
        claz.all.each do |object|
          errors = validation_errors object
          add_errors_to_summary errors, claz.name, object.id, summary, host: tenant.host if errors
        end
        t2 = Time.zone.now
        summary[:durations][claz.name] ||= 0
        summary[:durations][claz.name] += (t2 - t1)
      end
    end

    summary
  end

  private

  def validation_errors(object)
    return object.errors.details unless object.valid?

    if object.instance_of?(User) && !object.custom_field_values.values.select do |v|
         v.instance_of?(Array) ? v.include?(nil) : v.nil?
       end.empty?
      { custom_field_values: [{ error: 'Contains null values', value: object.custom_field_values }] }
    end
  end

  def add_errors_to_summary(errors, clazname, object_id, summary, host: nil)
    errors.each do |attribute, attribute_errors|
      attribute_errors.each do |error|
        msg = error[:error]
        error_type = "#{clazname}_#{attribute}_#{msg}"
        summary[:issues][error_type] ||= { count: 0, hosts: {} }
        summary[:issues][error_type][:count] += 1
        summary[:issues][error_type][:hosts] ||= {}
        summary[:issues][error_type][:hosts][host] ||= []
        summary[:issues][error_type][:hosts][host] += [object_id]
      end
    end
  end

  def skip_class_for_inconsistent_data_checking?(claz)
    # Skip checking for less crucial classes that require
    # a lot of processing.
    return true if SKIP_CLASSES.include? claz.name
    # return true if claz.name.nil?
    return true if claz.name.starts_with? 'Notifications::'

    false
  end

  def initial_summary
    { durations: {}, issues: {} }
  end
end

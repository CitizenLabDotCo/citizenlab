# frozen_string_literal: true

class Cl2DataListingService
  def cl2_global_models
    [PublicApi::ApiClient, Tenant]
  end

  def cl2_schema_root_models
    cl2_schema_models.select do |claz|
      claz.superclass.name == ApplicationRecord.name
    end
  end

  def cl2_schema_leaf_models
    cl2_schema_models.select do |claz|
      claz.descendants.empty?
    end
  end

  def cl2_schema_models
    # After https://github.com/rails/rails/issues/37006.
    # It seems that we need to use Zeitwerk::Loader.eager_load_all
    # instead of Rails.application.eager_load!.
    Zeitwerk::Loader.eager_load_all if Rails.env.development? || (File.basename($PROGRAM_NAME) == 'rake')
    views = ActiveRecord::Base.connection.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_type = 'VIEW'"
    ).pluck('table_name')
    ActiveRecord::Base.descendants.select do |claz|
      [
        *ActiveRecord::Base.subclasses.map(&:name),
        PublicApi::ApiClient.name,
        Tenant.name
      ].exclude? claz.name
    end.select do |claz|
      views.exclude? claz.table_name
    end
  end

  def timestamp_attributes(model_class)
    model_class.column_names.select do |column_name|
      column_name.ends_with? '_at'
    end
  end

  def multiloc_attributes(model_class)
    model_class.column_names.select do |column_name|
      column_name.ends_with? '_multiloc'
    end
  end

  def html_multiloc_attributes(model_class)
    multiloc_attributes(model_class).select do |atr|
      model_class.validators.any? do |v|
        v.attributes.include?(atr.to_sym) && v.options[:html]
      end
    end
  end
end

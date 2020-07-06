class Cl2DataListingService

  def cl2_tenant_models
    # After https://github.com/rails/rails/issues/37006.
    # It seems that we need to use Zeitwerk::Loader.eager_load_all
    # instead of Rails.application.eager_load!.
    Zeitwerk::Loader.eager_load_all if Rails.env.development? || (File.basename($0) == 'rake')
    views = ActiveRecord::Base.connection.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_type = 'VIEW'"
      ).map{|r| r['table_name']}
    ActiveRecord::Base.descendants.select do |claz|
      ![
        *ActiveRecord::Base.subclasses.map(&:name),
        PublicApi::ApiClient.name, 
        Tenant.name
      ].include? claz.name
    end.select do |claz|
      claz.descendants.empty? && !views.include?(claz.table_name)
    end
  end

  def cl2_root_models
    [PublicApi::ApiClient, Tenant]
  end

  def timestamp_attributes model_class
    model_class.column_names.select do |column_name|
      column_name.ends_with? '_at'
    end
  end

  def multiloc_attributes model_class
    model_class.column_names.select do |column_name|
      column_name.ends_with? '_multiloc'
    end
  end

end
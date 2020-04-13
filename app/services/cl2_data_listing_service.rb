class Cl2DataListingService

  def cl2_tenant_models
    ActiveRecord::Base.descendants.select do |claz|
      ![
        'PgSearch::Document', 
        'Apartment::Adapters::AbstractAdapter::SeparateDbConnectionHandler', 
        'ApplicationRecord', 
        'PublicApi::ApiClient', 
        'Tenant'
      ].include? claz.name
    end.select do |claz|
      claz.descendants.empty?
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

end
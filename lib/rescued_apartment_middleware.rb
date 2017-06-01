class RescuedApartmentMiddleware < ::Apartment::Elevators::Generic
  def call(env)
    super
  rescue ::Apartment::TenantNotFound
    
    [301, {'Location' => 'http://some.url'}, ['redirect']]
  end
end
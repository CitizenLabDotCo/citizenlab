class Tenant < ApplicationRecord

  validates :name, :host, presence: true
  validates :host, uniqueness: true

  after_create :create_apartment_tenant
  after_destroy :delete_apartment_tenant

  def create_apartment_tenant
    Apartment::Tenant.create(self.host)
  end

  def delete_apartment_tenant
    Apartment::Tenant.drop(self.host)
  end

end

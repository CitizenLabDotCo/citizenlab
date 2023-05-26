class UpdateQueTablesToVersion6 < ActiveRecord::Migration[6.1]
  def up
    # The "que" tables (and other database objects) are shared across tenants and are
    # stored in the public schema. Some tenants may contain copies of those tables
    # (from previous migrations) but they are not used.
    return unless Apartment::Tenant.current == 'public'

    Que.migrate!(version: 6)
  end

  def down
    return unless Apartment::Tenant.current == 'public'

    Que.migrate!(version: 5)
  end
end

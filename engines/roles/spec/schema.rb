ActiveRecord::Schema.define do
  self.verbose = false

  create_table :dummy_users, force: true do |t|
    t.jsonb 'roles', default: []

    t.timestamps
  end

  create_table :dummy_projects, force: true do |t|
    t.timestamps
  end

  create_table :dummy_publications, force: true do |t|
    t.integer 'publicatable_id'
    t.string 'publicatable_type'
    t.timestamps
  end
end

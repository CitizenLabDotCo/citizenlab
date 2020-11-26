ENV["RAILS_ENV"] = 'test'

require 'active_record'
require 'factory_bot_rails'

# load File.dirname(__FILE__) + '/schema.rb'
require File.dirname(__FILE__) + '/factories.rb'

RSpec.configure do |config|
  ActiveRecord::Migration.verbose = false

  config.before(:each) do |_example|
    ActiveRecord::Migration.create_table :tmp_roles_dummy_users, force: true do |t|
      t.jsonb 'roles', default: []

      t.timestamps
    end

    ActiveRecord::Migration.create_table :tmp_roles_dummy_projects, force: true do |t|
      t.timestamps
    end

    ActiveRecord::Migration.create_table :tmp_roles_dummy_publications, force: true do |t|
      t.integer 'publicatable_id'
      t.string 'publicatable_type'
      t.timestamps
    end

    DummyUser.table_name = 'tmp_roles_dummy_users'
    DummyProject.table_name = 'tmp_roles_dummy_projects'
    DummyPublication.table_name = 'tmp_roles_dummy_publications'
  end

  config.after(:each) do |_example|
    ActiveRecord::Migration.drop_table :tmp_roles_dummy_users, force: true
    ActiveRecord::Migration.drop_table :tmp_roles_dummy_projects, force: true
    ActiveRecord::Migration.drop_table :tmp_roles_dummy_publications, force: true
  end
end

# frozen_string_literal: true

# NOTE: Like the other specs in this directory, this file is named `*_spec.ignore.rb`
# so it is NOT picked up by the default RSpec run (which only matches `*_spec.rb`).
# Run it explicitly with:
#
#   bundle exec rspec spec/migrations/20260611120000_rework_permission_auth_requirements_spec.ignore.rb
#
# We drive the data migration with raw SQL inserts so we can create permissions
# with the *old* `permitted_by` values ('everyone_confirmed_email', 'verified')
# that the model no longer accepts.

require 'rails_helper'
require Rails.root.join('db/migrate/20260611120000_rework_permission_auth_requirements')

RSpec.describe ReworkPermissionAuthRequirements do
  subject(:migration) { described_class.new }

  def columns_added?
    ActiveRecord::Base.connection.column_exists?(:permissions, :require_confirmed_email)
  end

  # Start every example from the pre-migration schema, regardless of the order
  # examples run in (RSpec randomises order).
  before do
    migration.migrate(:up) unless columns_added?
    migration.migrate(:down)
  end

  # Restore the post-migration schema afterwards so the DB is left as the rest of
  # the suite expects it. after(:all) is intentional here: the schema change must
  # be restored once, not after every example.
  after(:all) { described_class.new.migrate(:up) unless ActiveRecord::Base.connection.column_exists?(:permissions, :require_confirmed_email) } # rubocop:disable RSpec/BeforeAfterAll

  let(:connection) { ActiveRecord::Base.connection }

  def insert_permission(permitted_by, action: 'visiting')
    connection.select_value(<<~SQL.squish)
      INSERT INTO permissions (action, permitted_by, created_at, updated_at)
      VALUES (#{connection.quote(action)}, #{connection.quote(permitted_by)}, now(), now())
      RETURNING id;
    SQL
  end

  def fetch(id)
    connection.select_one(<<~SQL.squish)
      SELECT permitted_by, require_confirmed_email, require_name, require_password, require_verification
      FROM permissions WHERE id = #{connection.quote(id)};
    SQL
  end

  it 'adds the new authentication-requirement columns' do
    %i[require_confirmed_email confirmed_email_expiry require_name require_password require_verification].each do |column|
      expect(connection.column_exists?(:permissions, column)).to be(false)
    end

    migration.migrate(:up)

    expect(connection.column_exists?(:permissions, :require_confirmed_email)).to be(true)
    expect(connection.column_exists?(:permissions, :confirmed_email_expiry)).to be(true)
    expect(connection.column_exists?(:permissions, :require_name)).to be(true)
    expect(connection.column_exists?(:permissions, :require_password)).to be(true)
    expect(connection.column_exists?(:permissions, :require_verification)).to be(true)
  end

  it 'migrates everyone_confirmed_email to a users permission that only requires a confirmed email' do
    id = insert_permission('everyone_confirmed_email')

    migration.migrate(:up)

    row = fetch(id)
    expect(row['permitted_by']).to eq('users')
    expect(row['require_confirmed_email']).to be(true)
    expect(row['require_verification']).to be(false)
    expect(row['require_name']).to be(false)
    expect(row['require_password']).to be(false)
  end

  it 'migrates verified to a users permission that requires a confirmed email and verification' do
    id = insert_permission('verified')

    migration.migrate(:up)

    row = fetch(id)
    expect(row['permitted_by']).to eq('users')
    expect(row['require_confirmed_email']).to be(true)
    expect(row['require_verification']).to be(true)
    expect(row['require_name']).to be(false)
    expect(row['require_password']).to be(false)
  end

  it 'leaves a genuine users permission with the column defaults' do
    id = insert_permission('users')

    migration.migrate(:up)

    row = fetch(id)
    expect(row['permitted_by']).to eq('users')
    expect(row['require_confirmed_email']).to be(true)
    expect(row['require_verification']).to be(false)
    expect(row['require_name']).to be(true)
    expect(row['require_password']).to be(true)
  end

  it 'leaves an everyone permission untouched (with the column defaults)' do
    id = insert_permission('everyone')

    migration.migrate(:up)

    row = fetch(id)
    expect(row['permitted_by']).to eq('everyone')
    expect(row['require_confirmed_email']).to be(true)
    expect(row['require_verification']).to be(false)
    expect(row['require_name']).to be(true)
    expect(row['require_password']).to be(true)
  end

  describe 'down' do
    it 'restores the old permitted_by values and drops the columns' do
      migration.migrate(:up)

      everyone_confirmed_id = connection.select_value(<<~SQL.squish)
        INSERT INTO permissions (action, permitted_by, require_confirmed_email, require_name, require_password, require_verification, created_at, updated_at)
        VALUES ('visiting', 'users', TRUE, FALSE, FALSE, FALSE, now(), now())
        RETURNING id;
      SQL
      verified_id = connection.select_value(<<~SQL.squish)
        INSERT INTO permissions (action, permitted_by, require_confirmed_email, require_name, require_password, require_verification, created_at, updated_at)
        VALUES ('visiting', 'users', TRUE, FALSE, FALSE, TRUE, now(), now())
        RETURNING id;
      SQL
      plain_users_id = connection.select_value(<<~SQL.squish)
        INSERT INTO permissions (action, permitted_by, require_confirmed_email, require_name, require_password, require_verification, created_at, updated_at)
        VALUES ('visiting', 'users', TRUE, TRUE, TRUE, FALSE, now(), now())
        RETURNING id;
      SQL

      migration.migrate(:down)

      permitted_by = lambda do |id|
        connection.select_value("SELECT permitted_by FROM permissions WHERE id = #{connection.quote(id)};")
      end

      expect(permitted_by.call(everyone_confirmed_id)).to eq('everyone_confirmed_email')
      expect(permitted_by.call(verified_id)).to eq('verified')
      expect(permitted_by.call(plain_users_id)).to eq('users')

      expect(connection.column_exists?(:permissions, :require_confirmed_email)).to be(false)
      expect(connection.column_exists?(:permissions, :require_verification)).to be(false)
    end
  end
end

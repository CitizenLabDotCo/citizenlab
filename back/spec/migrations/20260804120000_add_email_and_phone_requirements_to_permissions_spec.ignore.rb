# frozen_string_literal: true

# NOTE: Like the other specs in this directory, this file is named `*_spec.ignore.rb`
# so it is NOT picked up by the default RSpec run (which only matches `*_spec.rb`).
# Run it explicitly with:
#
#   bundle exec rspec spec/migrations/20260804120000_add_email_and_phone_requirements_to_permissions_spec.ignore.rb
#
# We drive the data migration with raw SQL so we can read and write the boolean
# columns the model no longer knows about.

require 'rails_helper'
require Rails.root.join('db/migrate/20260804120000_add_email_and_phone_requirements_to_permissions')

RSpec.describe AddEmailAndPhoneRequirementsToPermissions do
  subject(:migration) { described_class.new }

  let(:connection) { ActiveRecord::Base.connection }

  def migrated?
    connection.column_exists?(:permissions, :email_and_phone_requirements)
  end

  # Start every example from the pre-migration schema, regardless of the order
  # examples run in (RSpec randomises order).
  before do
    migration.migrate(:up) unless migrated?
    migration.migrate(:down)
  end

  # Restore the post-migration schema afterwards so the DB is left as the rest of
  # the suite expects it. after(:all) is intentional here: the schema change must
  # be restored once, not after every example.
  after(:all) { described_class.new.migrate(:up) unless ActiveRecord::Base.connection.column_exists?(:permissions, :email_and_phone_requirements) } # rubocop:disable RSpec/BeforeAfterAll

  def insert_permission(email:, phone:, action: 'visiting')
    connection.select_value(<<~SQL.squish)
      INSERT INTO permissions (action, permitted_by, require_confirmed_email, require_confirmed_phone_number, created_at, updated_at)
      VALUES (#{connection.quote(action)}, 'users', #{connection.quote(email)}, #{connection.quote(phone)}, now(), now())
      RETURNING id;
    SQL
  end

  def requirements_of(id)
    connection.select_value("SELECT email_and_phone_requirements FROM permissions WHERE id = #{connection.quote(id)};")
  end

  describe 'up' do
    it 'replaces the two boolean columns with the enum column' do
      expect(connection.column_exists?(:permissions, :require_confirmed_email)).to be(true)
      expect(connection.column_exists?(:permissions, :require_confirmed_phone_number)).to be(true)

      migration.migrate(:up)

      expect(connection.column_exists?(:permissions, :email_and_phone_requirements)).to be(true)
      expect(connection.column_exists?(:permissions, :require_confirmed_email)).to be(false)
      expect(connection.column_exists?(:permissions, :require_confirmed_phone_number)).to be(false)
    end

    it 'keeps the expiry columns' do
      migration.migrate(:up)

      expect(connection.column_exists?(:permissions, :confirmed_email_expiry)).to be(true)
      expect(connection.column_exists?(:permissions, :confirmed_phone_number_expiry)).to be(true)
    end

    it 'maps every combination of the two booleans' do
      neither = insert_permission(email: false, phone: false)
      email_only = insert_permission(email: true, phone: false)
      phone_without_email = insert_permission(email: false, phone: true)
      both = insert_permission(email: true, phone: true)

      migration.migrate(:up)

      expect(requirements_of(neither)).to eq('neither')
      expect(requirements_of(email_only)).to eq('email_only')
      expect(requirements_of(both)).to eq('both_email_and_phone')
      # There is no phone-only value. No such permission should exist anyway,
      # since the sms feature is still disabled everywhere.
      expect(requirements_of(phone_without_email)).to eq('either_email_or_phone')
    end

    it 'defaults new rows to email_only' do
      migration.migrate(:up)

      id = connection.select_value(<<~SQL.squish)
        INSERT INTO permissions (action, permitted_by, created_at, updated_at)
        VALUES ('visiting', 'users', now(), now())
        RETURNING id;
      SQL

      expect(requirements_of(id)).to eq('email_only')
    end
  end

  describe 'down' do
    def insert_migrated_permission(requirements)
      connection.select_value(<<~SQL.squish)
        INSERT INTO permissions (action, permitted_by, email_and_phone_requirements, created_at, updated_at)
        VALUES ('visiting', 'users', #{connection.quote(requirements)}, now(), now())
        RETURNING id;
      SQL
    end

    def booleans_of(id)
      row = connection.select_one(<<~SQL.squish)
        SELECT require_confirmed_email, require_confirmed_phone_number
        FROM permissions WHERE id = #{connection.quote(id)};
      SQL
      [row['require_confirmed_email'], row['require_confirmed_phone_number']]
    end

    it 'restores the two boolean columns and drops the enum column' do
      migration.migrate(:up)
      neither = insert_migrated_permission('neither')
      email_only = insert_migrated_permission('email_only')
      both = insert_migrated_permission('both_email_and_phone')

      migration.migrate(:down)

      expect(connection.column_exists?(:permissions, :email_and_phone_requirements)).to be(false)
      expect(booleans_of(neither)).to eq([false, false])
      expect(booleans_of(email_only)).to eq([true, false])
      expect(booleans_of(both)).to eq([true, true])
    end

    it 'degrades either_email_or_phone to requiring both, which the booleans cannot express' do
      migration.migrate(:up)
      either = insert_migrated_permission('either_email_or_phone')

      migration.migrate(:down)

      expect(booleans_of(either)).to eq([true, true])
    end
  end
end

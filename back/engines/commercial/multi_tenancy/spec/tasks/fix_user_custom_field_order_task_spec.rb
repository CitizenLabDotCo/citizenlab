# frozen_string_literal: true

require 'rails_helper'

describe 'rake fix_existing_tenants' do # rubocop:disable RSpec/DescribeClass
  before { load_rake_tasks_if_not_loaded }

  describe ':fix_user_custom_field_order' do
    it 'Makes the ordering field sequential for all user custom fields' do
      Tenant.first.update!(creation_finalized_at: Time.now)
      custom_fields = create_list(:custom_field, 4)
      ActiveRecord::Base.connection.execute("UPDATE custom_fields SET ordering = 0 WHERE id != '#{custom_fields[3].id}'")
      expect(CustomField.registration.order(:ordering).map(&:ordering)).to eq [0, 0, 0, 3]

      Rake::Task['fix_existing_tenants:fix_user_custom_field_order'].invoke
      expect(custom_fields[3].reload.ordering).to eq 3
      expect(CustomField.registration.order(:ordering)[3].id).to eq custom_fields[3].id
      expect(CustomField.registration.order(:ordering).map(&:ordering)).to eq [0, 1, 2, 3]
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

describe 'MultiTenancy::Extensions::AppConfiguration' do
  describe '.all' do
    it 'lists all app configuration' do
      expected_configs = Tenant.all.map(&:configuration) # the not-efficient way of getting configs.
      expect(::AppConfiguration.of_all_tenants).to match_array(expected_configs)
    end
  end
end
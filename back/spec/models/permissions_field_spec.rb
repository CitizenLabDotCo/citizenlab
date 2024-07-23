# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PermissionsField do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:permissions_field)).to be_valid
    end

    it 'is not valid if "custom_field" and no custom field is associated' do
      expect(build(:permissions_field, custom_field: nil)).not_to be_valid
    end
  end
end

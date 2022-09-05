# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::InitiativeSerializer do
  context "with 'abbreviated user names' enabled" do
    before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

    let(:jane) { create(:user, first_name: 'Jane', last_name: 'Doe') }
    let(:john) { create(:user, first_name: 'John', last_name: 'Smith') }
    let(:admin) { create(:admin, first_name: 'Thomas', last_name: 'Anderson') }

    it 'should abbreviate the author name' do
      jane_initiative = create(:initiative, author: jane)
      last_name = described_class
        .new(jane_initiative, params: { current_user: john })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Jane D.'
    end

    it 'should not abbreviate user names for admins' do
      jane_initiative = create(:initiative, author: jane)
      last_name = described_class
        .new(jane_initiative, params: { current_user: admin })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Jane Doe'

      admin_initiative = create(:initiative, author: admin)
      last_name = described_class
        .new(admin_initiative, params: { current_user: john })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Thomas Anderson'
    end
  end
end

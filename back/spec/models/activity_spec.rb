# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Activity do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:activity)).to be_valid
    end

    describe 'without item' do
      it 'is invalid' do
        expect(build(:activity, item: nil)).to be_invalid
      end
    end

    describe 'channel' do
      it 'is valid when nil (the regular web/API path)' do
        expect(build(:activity, channel: nil)).to be_valid
      end

      it "is valid when 'mcp'" do
        expect(build(:activity, channel: 'mcp')).to be_valid
      end

      it 'is invalid for any other value' do
        expect(build(:activity, channel: 'web')).to be_invalid
      end
    end

    describe '.management scope' do
      let_it_be(:admin, reload: true) { create(:admin) }
      let_it_be(:moderator, reload: true) { create(:user, roles: [{ type: 'project_moderator', project_id: SecureRandom.uuid }]) }
      let_it_be(:user, reload: true) { create(:user) }
      let(:management_filters) { described_class::MANAGEMENT_FILTERS }

      let_it_be(:a1, reload: true) { create(:idea_created_activity, user: admin) }
      let_it_be(:a2, reload: true) { create(:idea_deleted_activity, user: moderator) }
      let_it_be(:a3, reload: true) { create(:idea_changed_activity, user: admin) }
      let_it_be(:a4, reload: true) { create(:phase_created_activity, user: admin) }
      let_it_be(:a5, reload: true) { create(:phase_changed_activity, user: moderator) }
      let_it_be(:a6, reload: true) { create(:phase_deleted_activity, user: admin) }
      let_it_be(:a7, reload: true) { create(:project_created_activity, user: admin) }
      let_it_be(:a8, reload: true) { create(:project_changed_activity, user: moderator) }
      let_it_be(:a9, reload: true) { create(:project_deleted_activity, user: admin) }
      let_it_be(:a10, reload: true) { create(:project_folder_created_activity, user: admin) }
      let_it_be(:a11, reload: true) { create(:project_folder_changed_activity, user: moderator) }
      let_it_be(:a12, reload: true) { create(:project_folder_deleted_activity, user: admin) }

      it "includes 'Management Feed' activities" do
        expect(described_class.management).to contain_exactly(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12)
      end

      it 'excludes activities where item_type is not in the MANAGEMENT_FILTERS' do
        item = create(:user)
        activity = create(:activity, item: item, action: 'changed', user: admin)

        expect(management_filters.find { |x| x[:item_type] == activity.item_type }).to be_nil
        expect(described_class.management).not_to include(activity)
      end

      it 'excludes activities where action is not in the MANAGEMENT_FILTERS' do
        activity = create(:project_published_activity, user: admin)

        expect(management_filters.find { |x| x[:item_type] == activity.item_type }).to be_present
        expect(management_filters.find { |x| x[:item_type] == activity.item_type }[:actions])
          .not_to include(activity.action)
        expect(described_class.management).not_to include(activity)
      end

      it "includes Permission 'changed' activities" do
        activity = create(:activity, item: create(:permission), action: 'changed', user: admin)
        expect(described_class.management).to include(activity)
      end

      it "excludes Permission 'changed_permitted_by' activities" do
        activity = create(:activity, item: create(:permission), action: 'changed_permitted_by', user: admin)
        expect(described_class.management).not_to include(activity)
      end

      it 'excludes activities where actor is not an admin or moderator' do
        activity = create(:idea_created_activity, user: user)
        expect(described_class.management).not_to include(activity)
      end

      it 'includes activities where acted_at is later than 30 days ago' do
        activity = create(:idea_created_activity, user: admin, acted_at: 29.days.ago)
        expect(described_class.management).to include(activity)
      end

      it 'excludes activities where acted_at is earlier than 30 days ago' do
        activity = create(:idea_created_activity, user: admin, acted_at: 31.days.ago)
        expect(described_class.management).not_to include(activity)
      end
    end
  end
end

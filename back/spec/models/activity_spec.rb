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

    describe '.management scope' do
      let(:admin) { create(:admin) }
      let(:moderator) { create(:user, roles: [{ type: 'project_moderator', project_id: SecureRandom.uuid }]) }
      let(:user) { create(:user) }
      let(:management_filters) { described_class::MANAGEMENT_FILTERS }

      let!(:a1) { create(:idea_created_activity, user: admin) }
      let!(:a2) { create(:idea_deleted_activity, user: moderator) }
      let!(:a3) { create(:idea_changed_activity, user: admin) }
      let!(:a4) { create(:phase_created_activity, user: admin) }
      let!(:a5) { create(:phase_changed_activity, user: moderator) }
      let!(:a6) { create(:phase_deleted_activity, user: admin) }
      let!(:a7) { create(:project_created_activity, user: admin) }
      let!(:a8) { create(:project_changed_activity, user: moderator) }
      let!(:a9) { create(:project_deleted_activity, user: admin) }
      let!(:a10) { create(:project_folder_created_activity, user: admin) }
      let!(:a11) { create(:project_folder_changed_activity, user: moderator) }
      let!(:a12) { create(:project_folder_deleted_activity, user: admin) }

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

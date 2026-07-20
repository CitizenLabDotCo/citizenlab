# frozen_string_literal: true

require 'rails_helper'

# Guards the "consistent statistics" goal: the numbers the new contributions
# fact produces must match the legacy participation fact wherever the two
# models make the same modelling choice, and every deliberate divergence is
# pinned down explicitly so it can never drift in unnoticed.
RSpec.describe 'reporting_contributions parity with Analytics::FactParticipation' do # rubocop:disable RSpec/DescribeClass
  before_all do
    Analytics::PopulateDimensionsService.populate_types
  end

  def contributions = Analytics::Reporting::Contribution
  def legacy = Analytics::FactParticipation

  def legacy_count(*type_names)
    legacy.joins(:dimension_type).where(analytics_dimension_types: { name: type_names }).count
  end

  context 'with one contribution of every kind' do
    before do
      create(:idea_status_proposed)
      create(:idea, submitted_at: Time.zone.now)
      create(:native_survey_response)
      create(:idea, anonymous: true, submitted_at: Time.zone.now)
      create(:comment)
      create(:reaction)
      create(:comment_reaction)
      create(:baskets_idea, basket: create(:basket))
      create(:volunteer)
      create(:poll_response)
      create(:event_attendance)
    end

    it 'counts the same distinct participants' do
      expect(contributions.distinct.count(:participant_id))
        .to eq legacy.distinct.count(:participant_id)
    end

    it 'counts the same rows for the types whose grain is unchanged' do
      expect(contributions.where(type: 'input').count).to eq legacy_count('idea', 'survey')
      expect(contributions.where(type: 'comment').count).to eq legacy_count('comment')
      expect(contributions.where(type: 'reaction').count).to eq legacy_count('reaction')
      expect(contributions.where(type: 'volunteering').count).to eq legacy_count('volunteer')
      expect(contributions.where(type: 'poll_response').count).to eq legacy_count('poll')
      expect(contributions.where(type: 'attendance').count).to eq legacy_count('event_attendance')
    end
  end

  describe 'deliberate divergences from the legacy fact' do
    it 'excludes votes in unsubmitted baskets, which the legacy fact counts' do
      create(:baskets_idea, basket: create(:basket, submitted_at: nil))

      expect(legacy_count('basket')).to eq 1
      expect(contributions.where(type: 'vote')).to be_empty
    end

    it 'counts votes per picked input, where the legacy fact counts one row per basket' do
      create_list(:baskets_idea, 2, basket: create(:basket))

      expect(legacy_count('basket')).to eq 1
      expect(contributions.where(type: 'vote').count).to eq 2
      expect(contributions.distinct.count(:participant_id))
        .to eq legacy.distinct.count(:participant_id)
    end

    it 'excludes deleted comments, which the legacy fact counts' do
      create(:comment).update_column(:publication_status, 'deleted')

      expect(legacy_count('comment')).to eq 1
      expect(contributions.where(type: 'comment')).to be_empty
    end
  end
end

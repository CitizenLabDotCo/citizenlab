# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactParticipation do
  context 'when an idea activity is created' do
    let!(:idea_activity) { create(:activity) }

    it 'is also available as a participation fact' do
      described_class.find(idea_activity.id)
      expect(described_class.find(idea_activity.id).item_type).to eq('Idea')
    end
  end

  context 'when an initiative activity is created' do
    let!(:initiative_activity) do
      create(:activity, item_type: 'Initiative')
    end

    it 'is also available as a participation fact' do
      described_class.find(initiative_activity.id)
      expect(described_class.find(initiative_activity.id).item_type).to eq('Initiative')
    end
  end

  context 'when a comment activity is added' do
    let!(:comment_activity) do
      create(:activity, item_type: 'Comment', action: 'created')
    end

    it 'is also available as a participation fact' do
      described_class.find(comment_activity.id)
      expect(described_class.find(comment_activity.id).item_type).to eq('Comment')
    end
  end

  context 'when a reaction activity is added' do
    let!(:reaction_activity) do
      create(
        :activity,
        item_type: 'Reaction',
        action: 'idea_liked',
        payload: {
          reactable_type: 'Idea',
          reactable_id: SecureRandom.uuid
        }
      )
    end

    it 'is also available as a participation fact' do
      described_class.find(reaction_activity.id)
      expect(described_class.find(reaction_activity.id).item_type).to eq('Reaction')
    end
  end

  context 'when a volunteer activity is added' do
    let!(:volunteer_activity) do
      create(
        :activity,
        item_type: 'Volunteering::Volunteer',
        action: 'created'
      )
    end

    it 'is also available as a participation fact' do
      described_class.find(volunteer_activity.id)
      expect(described_class.find(volunteer_activity.id).item_type).to eq('Volunteering::Volunteer')
    end
  end

  context 'when a poll activity is added' do
    let!(:poll_activity) do
      create(
        :activity,
        item_type: 'Polls::Response',
        action: 'created'
      )
    end

    it 'is also available as a participation fact' do
      described_class.find(poll_activity.id)
      expect(described_class.find(poll_activity.id).item_type).to eq('Polls::Response')
    end
  end

  context 'when an event attendance activity is added' do
    let!(:event_attendance_activity) do
      create(
        :activity,
        item_type: 'Events::Attendance',
        action: 'created'
      )
    end

    it 'is also available as a participation fact' do
      described_class.find(event_attendance_activity.id)
      expect(described_class.find(event_attendance_activity.id).item_type).to eq('Events::Attendance')
    end
  end

  context 'when a follower activity is added' do
    let!(:follower_activity) do
      create(
        :activity,
        item_type: 'Follower',
        action: 'created'
      )
    end

    it 'is also available as a participation fact' do
      described_class.find(follower_activity.id)
      expect(described_class.find(follower_activity.id).item_type).to eq('Follower')
    end
  end
end

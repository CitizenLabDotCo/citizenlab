# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Events::Attendance do
  subject(:attendance) { build(:event_attendance) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:event) }
  it { is_expected.to belong_to(:attendee).class_name('User') }

  specify do
    expect(attendance)
      .to validate_uniqueness_of(:attendee)
      .scoped_to(:event_id)
      .with_message('is already registered to this event')
  end

  describe 'maximum_attendees_not_reached validation' do
    let!(:event) { create(:event, maximum_attendees: 5) }
    let(:attendance) { build(:event_attendance, event: event) }

    before do
      # Mock the attendees_count to simulate different scenarios
      allow(event).to receive(:attendees_count).and_return(0)
    end

    it 'is valid when maximum_attendees is nil' do
      allow(event).to receive(:maximum_attendees).and_return(nil)
      expect(attendance).to be_valid
    end

    it 'is valid when attendees_count is less than maximum_attendees' do
      allow(event).to receive(:attendees_count).and_return(4)
      expect(attendance).to be_valid
    end

    it 'is invalid when attendees_count equals maximum_attendees' do
      allow(event).to receive(:attendees_count).and_return(5)
      expect(attendance).to be_invalid
      expect(attendance.errors[:base]).to include('Maximum number of attendees reached')
    end

    it 'is invalid when attendees_count exceeds maximum_attendees' do
      allow(event).to receive(:attendees_count).and_return(6)
      expect(attendance).to be_invalid
      expect(attendance.errors[:base]).to include('Maximum number of attendees reached')
    end
  end
end

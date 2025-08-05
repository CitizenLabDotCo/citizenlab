# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Event do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:event)).to be_valid
    end
  end

  describe 'associations' do
    subject(:event) { build(:event) }

    it { is_expected.to belong_to(:project) }
    it { is_expected.to have_many(:attendances).dependent(:destroy) }
    it { is_expected.to have_many(:attendees).through(:attendances) }
    it { is_expected.to have_many(:event_files).dependent(:destroy) }
    it { is_expected.to have_many(:text_images).dependent(:destroy) }
    it { is_expected.to validate_presence_of(:title_multiloc) }
  end

  describe 'description sanitizer' do
    it 'sanitizes script tags in the description' do
      event = create(:event, description_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(event.description_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end

    it 'retains paragraphs and line breaks in the description' do
      event = create(:event, description_multiloc: {
        'en' => '<p>Test<br><br>One<br>Two</p><p>Three</p>'
      })
      expect(event.description_multiloc).to eq({ 'en' => '<p>Test<br><br>One<br>Two</p><p>Three</p>' })
    end
  end

  describe 'timing validation' do
    it 'succeeds when start_at and end_at are equal' do
      event = build(:event)
      event.end_at = event.start_at
      expect(event).to be_valid
    end

    it 'fails when end_at is before start_at' do
      event = build(:event)
      event.end_at = event.start_at - 1.minute
      expect(event).to be_invalid
    end
  end

  describe 'online_link' do
    it 'succeeds when online link is a valid url' do
      event = build(:event)
      event.online_link = 'https://www.example.com'
      expect(event).to be_valid
    end

    it 'fails when online link is not a valid url' do
      event = build(:event)
      event.online_link = 'not valid url'
      expect(event).to be_invalid
    end
  end

  describe 'attendees_count' do
    let(:event) { create(:event) }

    it 'is incremented when an attendance is created' do
      expect { create(:event_attendance, event: event) }
        .to change { event.reload.attendees_count }.by(1)
    end

    it 'is decremented when an attendance is destroyed' do
      attendance = create(:event_attendance, event: event)
      expect { attendance.destroy }
        .to change { event.reload.attendees_count }.by(-1)
    end
  end

  describe 'maximum_attendees validation' do
    it 'allows nil value' do
      event = build(:event, maximum_attendees: nil)
      expect(event).to be_valid
    end

    it 'allows positive integers' do
      event = build(:event, maximum_attendees: 10)
      expect(event).to be_valid
    end

    it 'does not allow negative integers' do
      event = build(:event, maximum_attendees: -5)
      expect(event).to be_invalid
      expect(event.errors[:maximum_attendees]).to include('must be greater than 0')
    end

    it 'does not allow zero' do
      event = build(:event, maximum_attendees: 0)
      expect(event).to be_invalid
      expect(event.errors[:maximum_attendees]).to include('must be greater than 0')
    end

    it 'does not allow non-integer values' do
      event = build(:event, maximum_attendees: 10.5)
      expect(event).to be_invalid
      expect(event.errors[:maximum_attendees]).to include('must be an integer')
    end
  end

  describe 'maximum_attendees_greater_than_attendees_count validation' do
    let(:event) { create(:event, maximum_attendees: nil, attendees_count: 0) }

    it 'is valid when maximum_attendees is nil' do
      event.attendees_count = 5
      expect(event).to be_valid
    end

    it 'is valid when attendees_count is nil' do
      event.maximum_attendees = 10
      event.attendees_count = nil
      expect(event).to be_valid
    end

    it 'is valid when maximum_attendees equals attendees_count' do
      event.maximum_attendees = 5
      event.attendees_count = 5
      expect(event).to be_valid
    end

    it 'is valid when maximum_attendees is greater than attendees_count' do
      event.maximum_attendees = 10
      event.attendees_count = 5
      expect(event).to be_valid
    end

    it 'is invalid when maximum_attendees is less than attendees_count' do
      event.maximum_attendees = 5
      event.attendees_count = 10
      expect(event).to be_invalid
      expect(event.errors[:maximum_attendees]).to include('must be greater than or equal to the current number of attendees')
    end

    it 'allows changing maximum_attendees when there are no attendees' do
      event.maximum_attendees = 1
      event.attendees_count = 0
      expect(event).to be_valid
    end
  end
end

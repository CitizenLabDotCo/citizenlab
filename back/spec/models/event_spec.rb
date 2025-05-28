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
end

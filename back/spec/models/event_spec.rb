# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Event do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:event)).to be_valid
    end
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
end

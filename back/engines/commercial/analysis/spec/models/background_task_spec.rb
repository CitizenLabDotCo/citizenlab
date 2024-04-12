# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::BackgroundTask do
  describe 'Factories' do
    it 'are valid' do
      %i[auto_tagging_task summarization_task q_and_a_task].each do |factory|
        expect(build(factory)).to be_valid
      end
    end
  end

  describe 'generated_at' do
    let(:background_task) { create(:summarization_task) }
    let(:insightable) { create(:summary, background_task: background_task) }

    it 'is cleared when in progress' do
      insightable.update!(generated_at: Time.now)
      background_task.set_in_progress!
      expect(insightable.reload.generated_at).to be_nil
    end

    it 'is set when succeeded' do
      insightable.update!(generated_at: nil)
      freeze_time do
        background_task.set_succeeded!
        expect(insightable.reload.generated_at).to be_within(1.second).of(Time.now)
      end
    end
  end
end

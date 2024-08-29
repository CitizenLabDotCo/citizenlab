# frozen_string_literal: true

require 'rails_helper'

describe Polls::PollPhase do
  describe 'poll_questions_allowed_in_participation_method' do
    it 'invalidates the participation context when there are poll questions associated to a non-poll participation_method' do
      question = create(:poll_question)
      phase = question.phase
      phase.participation_method = 'information'
      expect(phase).to be_invalid
      expect(phase.errors.details).to eq({ base: [{ error: :cannot_contain_poll_questions, questions_count: 1 }] })
    end
  end

  describe 'anonymous_immutable_after_responses' do
    it 'allows editing poll_anonymous before the first response comes in' do
      phase = create(:single_phase_poll_project, phase_attrs: { poll_anonymous: true }).phases.first
      create(:poll_question, phase: phase)
      phase.poll_anonymous = false
      expect(phase).to be_valid
    end

    it "doesn't allow editing poll_anonymous after the first response came in" do
      phase = create(:single_phase_poll_project, phase_attrs: { poll_anonymous: true }).phases.first
      create(:poll_question, phase: phase)
      create(:poll_response, phase: phase)
      phase.poll_anonymous = false
      expect(phase).to be_invalid
      expect(phase.errors.details).to eq({ poll_anonymous: [{ error: :cant_change_after_first_response }] })
    end
  end
end

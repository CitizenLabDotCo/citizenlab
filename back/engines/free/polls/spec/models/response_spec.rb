# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Polls::Response do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:poll_response)).to be_valid
    end
  end

  describe do
    it 'adds an error when the user already responded to the poll' do
      pc = create(:continuous_poll_project)
      q1 = create(:poll_question, :with_options, participation_context: pc)
      user = create(:user)
      create(:poll_response, user: user, participation_context: pc, response_options_attributes: [{ option_id: q1.options.first.id }])

      r2 = build(:poll_response, user: user, participation_context: pc, response_options_attributes: [{ option_id: q1.options.first.id }])
      expect(r2.valid?(:response_submission)).to be false
      expect(r2.errors.details[:user]).to eq([{ error: :taken, value: user }])
    end
  end

  describe 'validate_option_count' do
    context 'on a single_option question' do
      let!(:pc) { create(:continuous_poll_project) }
      let!(:q1) { create(:poll_question, :with_options, participation_context: pc) }
      let!(:q2) { create(:poll_question, :with_options, participation_context: pc) }

      it 'adds no error when all questions are answered' do
        response = build(
          :poll_response,
          participation_context: pc,
          response_options_attributes: [
            { option_id: q1.options.first.id },
            { option_id: q2.options.first.id }
          ]
        )
        expect(response.valid?(:response_submission)).to be true
      end

      it 'adds an error when not all questions are answered' do
        response = build(
          :poll_response,
          participation_context: pc,
          response_options_attributes: [
            { option_id: q1.options.first.id }
          ]
        )
        expect(response.valid?(:response_submission)).to be false
        expect(response.errors.details).to eq({ base: [{ error: :too_few_options }] })
      end

      it 'adds an error when a question is answered with multiple options' do
        response = build(
          :poll_response,
          participation_context: pc,
          response_options_attributes: [
            { option_id: q1.options.first.id },
            { option_id: q1.options.last.id },
            { option_id: q2.options.first.id }
          ]
        )
        expect(response.valid?(:response_submission)).to be false
        expect(response.errors.details).to eq({ base: [{ error: :too_many_options }] })
      end
    end

    context 'on a multiple_options response' do
      let!(:pc) { create(:continuous_poll_project) }
      let!(:q1) { create(:poll_question_multiple_options, :with_options, participation_context: pc) }
      let!(:q2) { create(:poll_question_multiple_options, :with_options, participation_context: pc) }

      it 'adds no error when all questions are answered' do
        response = build(
          :poll_response,
          participation_context: pc,
          response_options_attributes: [
            { option_id: q1.options.first.id },
            { option_id: q1.options.second.id },
            { option_id: q2.options.first.id }
          ]
        )
        expect(response.valid?(:response_submission)).to be true
      end

      it 'adds an error when not all questions are answered' do
        response = build(
          :poll_response,
          participation_context: pc,
          response_options_attributes: [
            { option_id: q1.options.first.id }
          ]
        )
        expect(response.valid?(:response_submission)).to be false
        expect(response.errors.details).to eq({ base: [{ error: :too_few_options }] })
      end

      it "adds no error when the question's max_options are matched" do
        q1.update!(max_options: 2)
        q2.update!(max_options: 1)
        response = build(
          :poll_response,
          participation_context: pc,
          response_options_attributes: [
            { option_id: q1.options[0].id },
            { option_id: q1.options[1].id },
            { option_id: q2.options.first.id }
          ]
        )
        expect(response.valid?(:response_submission)).to be true
      end

      it "adds an error when the question's max_options are exceeded" do
        q1.update!(max_options: 2)
        response = build(
          :poll_response,
          participation_context: pc,
          response_options_attributes: [
            { option_id: q1.options[0].id },
            { option_id: q1.options[1].id },
            { option_id: q1.options[2].id },
            { option_id: q2.options.first.id }
          ]
        )
        expect(response.valid?(:response_submission)).to be false
        expect(response.errors.details).to eq({ base: [{ error: :too_many_options }] })
      end
    end
  end
end

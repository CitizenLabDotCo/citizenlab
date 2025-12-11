# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WiseVoiceDetectionJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    it 'creates a WiseVoiceFlag for a flaggable with an expert role' do
      flaggable = create(
        :idea,
        title_multiloc: { 'en' => 'Hire more teachers' },
        body_multiloc: { 'en' => 'As a school director, I witness daily how the shortage of qualified educating staff  impacts the quality of education in our community. We need to invest in education.' }
      )

      expect_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return({
        'has_wise_voice' => true,
        'role_multiloc' => { 'en' => 'School Director', 'fr-FR' => "Directeur d'école", 'nl-NL' => 'Schooldirecteur' },
        'quotes' => ['As a school director, I witness daily how the shortage of qualified educating staff  impacts the quality of education in our community.']
      }.to_json)

      expect { job.perform(flaggable) }.to change(WiseVoiceFlag, :count).from(0).to(1)
      expect(WiseVoiceFlag.first).to have_attributes({
        flaggable_id: flaggable.id,
        flaggable_type: 'Idea',
        role_multiloc: { 'en' => 'School Director', 'fr-FR' => "Directeur d'école", 'nl-NL' => 'Schooldirecteur' },
        quotes: ['As a school director, I witness daily how the shortage of qualified educating staff  impacts the quality of education in our community.']
      })
    end

    it 'does not create a WiseVoiceFlag for a flaggable without an expert role' do
      flaggable = create(
        :idea,
        title_multiloc: { 'en' => 'Improve public transportation' },
        body_multiloc: { 'en' => 'Public transportation is essential for our city. We should invest in more buses and trains to reduce traffic and pollution.' }
      )

      expect_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return({
        'has_wise_voice' => false,
        'role_multiloc' => nil,
        'quotes' => []
      }.to_json)

      expect { job.perform(flaggable) }.not_to change(WiseVoiceFlag, :count)
    end

    it 'works with comments as flaggables' do
      flaggable = create(
        :comment,
        body_multiloc: { 'en' => 'As a nutritionist, I can confirm that a balanced diet is crucial for maintaining good health. We should promote healthy eating habits in our community.' }
      )

      expect_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return({
        'has_wise_voice' => true,
        'role_multiloc' => { 'en' => 'Nutritionist', 'fr-FR' => 'Nutritionniste', 'nl-NL' => 'Voedingsdeskundige' },
        'quotes' => ['As a nutritionist, I can confirm that a balanced diet is crucial for maintaining good health.']
      }.to_json)

      expect { job.perform(flaggable) }.to change(WiseVoiceFlag, :count).from(0).to(1)
      expect(WiseVoiceFlag.first).to have_attributes({
        flaggable_id: flaggable.id,
        flaggable_type: 'Comment',
        role_multiloc: { 'en' => 'Nutritionist', 'fr-FR' => 'Nutritionniste', 'nl-NL' => 'Voedingsdeskundige' },
        quotes: ['As a nutritionist, I can confirm that a balanced diet is crucial for maintaining good health.']
      })
    end

    it 'handles JSON parsing errors gracefully' do
      flaggable = create(
        :idea,
        title_multiloc: { 'en' => 'Increase green spaces' },
        body_multiloc: { 'en' => 'Green spaces improve mental health and community well-being. We need more parks and gardens in our neighborhoods.' }
      )

      expect_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return('invalid json')

      expect(Rails.logger).to receive(:error).with(/WiseVoiceDetectionJob: JSON parsing error/)

      expect { job.perform(flaggable) }.not_to change(WiseVoiceFlag, :count)
    end

    context 'when a WiseVoiceFlag already exists for the flaggable' do
      let(:flaggable) do
        create(
          :idea,
          title_multiloc: { 'en' => 'Support local businesses' },
          body_multiloc: { 'en' => 'As a small business owner, I know how important it is to support local enterprises. We should create initiatives to help them thrive.' }
        )
      end
      let!(:existing_flag) do
        create(
          :wise_voice_flag,
          flaggable:,
          role_multiloc: { 'en' => 'small business owner' },
          quotes: ['As a small business owner, I know how important it is to support local enterprises.']
        )
      end

      it 'deletes the existing flag and creates a new one if wise voice is detected again' do
        expect_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return({
          'has_wise_voice' => true,
          'role_multiloc' => { 'en' => 'small business owner' },
          'quotes' => ['As a small business owner, I know how important it is to support local enterprises.']
        }.to_json)

        expect { job.perform(flaggable) }
          .not_to change(WiseVoiceFlag, :count)

        new_flag = flaggable.reload.wise_voice_flag
        expect(new_flag).not_to eq(existing_flag)
      end

      it 'deletes the existing flag if wise voice is no longer detected' do
        expect_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return({
          'has_wise_voice' => false,
          'role' => nil,
          'quotes' => []
        }.to_json)

        expect { job.perform(flaggable) }
          .to change(WiseVoiceFlag, :count).by(-1)

        expect(WiseVoiceFlag.find_by(flaggable:)).to be_nil
      end
    end
  end
end

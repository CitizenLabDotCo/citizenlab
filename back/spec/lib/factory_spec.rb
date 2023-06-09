# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Factory do
  describe '.instance' do
    it 'always returns the same object' do
      singleton = described_class.instance
      expect(described_class.instance).to equal singleton
    end
  end

  describe '.new' do
    it 'is a private method' do
      expect { described_class.new }.to raise_error NoMethodError
    end
  end

  describe '#participation_method_for' do
    let(:project_participation_method) { described_class.instance.participation_method_for(project) }
    let(:phase_participation_method) { described_class.instance.participation_method_for(phase) }

    context 'when the given participation_context is nil' do
      let(:project) { nil }
      let(:phase) { nil }

      it 'returns an instance of ParticipationMethod::None' do
        expect(project_participation_method).to be_an_instance_of(ParticipationMethod::None)
        expect(phase_participation_method).to be_an_instance_of(ParticipationMethod::None)
      end
    end

    {
      'information' => ParticipationMethod::Information,
      'ideation' => ParticipationMethod::Ideation,
      'document_annotation' => ParticipationMethod::DocumentAnnotation,
      'survey' => ParticipationMethod::Survey,
      'voting' => ParticipationMethod::Voting,
      'poll' => ParticipationMethod::Poll,
      'volunteering' => ParticipationMethod::Volunteering,
      'native_survey' => ParticipationMethod::NativeSurvey
    }.each do |method_name, method_class|
      context "when the given participation_context's method is #{method_name}" do
        let(:project) { build(:project, participation_method: method_name) }
        let(:phase) { build(:phase, participation_method: method_name) }

        it "returns an instance of #{method_class}" do
          expect(project_participation_method).to be_an_instance_of(method_class)
          expect(phase_participation_method).to be_an_instance_of(method_class)
        end
      end
    end
  end
end

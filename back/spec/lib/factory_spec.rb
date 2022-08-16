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
    subject(:participation_method) { described_class.instance.participation_method_for(project) }

    context 'for a project without participation context' do
      let(:project) { create :project_with_past_phases }

      it 'returns an instance of ParticipationMethod::None' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::None)
      end
    end

    context 'for an ideation project' do
      let(:project) { create :continuous_project, participation_method: 'ideation' }

      it 'returns an instance of ParticipationMethod::Ideation' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::Ideation)
      end
    end

    context 'for a budgeting project' do
      let(:project) { create :continuous_budgeting_project }

      it 'returns an instance of ParticipationMethod::Budgeting' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::Budgeting)
      end
    end

    context 'for a native survey project' do
      let(:project) { create :continuous_native_survey_project }

      it 'returns an instance of ParticipationMethod::NativeSurvey' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::NativeSurvey)
      end
    end

    context 'for a project with another participation method' do
      let(:project) { create :continuous_native_survey_project }

      it 'raises an error' do
        project.participation_method = 'unsupported'
        expect { participation_method }.to raise_error 'Unsupported participation method: unsupported'
      end
    end
  end

  describe '#json_schema_generator_class_for' do
    subject(:factory) { described_class.instance }

    context 'for resource type "CustomForm"' do
      it 'returns InputJsonSchemaGeneratorService' do
        expect(factory.json_schema_generator_class_for('CustomForm')).to be InputJsonSchemaGeneratorService
      end
    end

    context 'for resource type "User"' do
      it 'returns UserJsonSchemaGeneratorService' do
        expect(factory.json_schema_generator_class_for('User')).to be UserJsonSchemaGeneratorService
      end
    end

    context 'for unsupported resource types' do
      it 'raises an error' do
        expect { factory.json_schema_generator_class_for('Unsupported') }.to raise_error 'Unsupported resource type: Unsupported'
      end
    end
  end

  describe '#ui_schema_generator_class_for' do
    subject(:factory) { described_class.instance }

    context 'for resource type "CustomForm"' do
      it 'returns InputUiSchemaGeneratorService' do
        expect(factory.ui_schema_generator_class_for('CustomForm')).to be InputUiSchemaGeneratorService
      end
    end

    context 'for resource type "User"' do
      it 'returns UserUiSchemaGeneratorService' do
        expect(factory.ui_schema_generator_class_for('User')).to be UserUiSchemaGeneratorService
      end
    end

    context 'for unsupported resource types' do
      it 'raises an error' do
        expect { factory.ui_schema_generator_class_for('Unsupported') }.to raise_error 'Unsupported resource type: Unsupported'
      end
    end
  end
end

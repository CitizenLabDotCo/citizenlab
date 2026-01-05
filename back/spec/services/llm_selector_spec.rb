# frozen_string_literal: true

require 'rails_helper'

describe LLMSelector do
  let(:service) { described_class.new }

  it 'does not define any duplicate MODELS' do
    expect(described_class::MODELS.uniq.size).to eq(described_class::MODELS.size)
  end

  it 'does not define any duplicate keys in FAMILIES' do
    family_keys = described_class::FAMILIES.map(&:key)
    expect(family_keys.uniq.length).to eq(family_keys.length)
  end

  it 'does not define any duplicate keys in USE_CASES' do
    use_case_keys = described_class::USE_CASES.map(&:key)
    expect(use_case_keys.uniq.length).to eq(use_case_keys.length)
  end

  it 'always defines a default_model that is also in supported_models' do
    described_class::USE_CASES.each do |use_case|
      expect(use_case.supported_models).to include(use_case.default_model), "Use case #{use_case.key} has a default_model not in supported_models"
    end
  end

  it 'only lists models that specify a defined family' do
    family_keys = described_class::FAMILIES.map(&:key)
    described_class::MODELS.each do |model|
      expect(family_keys).to include(model.family), "Model #{model.class} references unknown family #{model.family}"
    end
  end

  it 'only lists models that are subclasses of Analysis::LLM::Base' do
    expect(described_class::MODELS).to all(be < Analysis::LLM::Base)
  end

  describe '#llm_class_for_use_case' do
    it 'raises an error for unknown use case keys' do
      expect do
        service.llm_class_for_use_case('non_existent_use_case')
      end.to raise_error(ArgumentError, /Use case not found/)
    end

    it 'returns the default model when no family is configured' do
      use_case = described_class::USE_CASES.first
      app_configuration = instance_double(AppConfiguration)
      allow(app_configuration).to receive(:settings).with('core', 'ai_providers', use_case.key).and_return(nil)

      selected_model = service.llm_class_for_use_case(use_case.key, app_configuration)
      expect(selected_model).to eq(use_case.default_model)
    end

    it 'returns the default model when family is configured as auto' do
      use_case = described_class::USE_CASES.first
      app_configuration = instance_double(AppConfiguration)
      allow(app_configuration).to receive(:settings).with('core', 'ai_providers', use_case.key).and_return('auto')
      selected_model = service.llm_class_for_use_case(use_case.key, app_configuration)
      expect(selected_model).to eq(use_case.default_model)
    end

    it 'returns the correct model for a configured family' do
      mock_model_a = Class.new(Analysis::LLM::Base) do
        define_singleton_method(:family) { 'family_a' }
      end
      mock_model_b = Class.new(Analysis::LLM::Base) do
        define_singleton_method(:family) { 'family_b' }
      end

      mock_family_a = described_class::LLMFamily.new(key: 'family_a', name: 'Family A', description: 'Test family A')
      mock_family_b = described_class::LLMFamily.new(key: 'family_b', name: 'Family B', description: 'Test family B')

      mock_use_case = described_class::LLMUseCase.new(
        key: 'test_use_case',
        description: 'Test use case',
        supported_models: [mock_model_a, mock_model_b],
        default_model: mock_model_a
      )

      stub_const('LLMSelector::FAMILIES', [mock_family_a, mock_family_b])
      stub_const('LLMSelector::MODELS', [mock_model_a, mock_model_b])
      stub_const('LLMSelector::USE_CASES', [mock_use_case])

      app_configuration = instance_double(AppConfiguration)
      allow(app_configuration).to receive(:settings).with('core', 'ai_providers', 'test_use_case').and_return('family_b')

      selected_model = service.llm_class_for_use_case('test_use_case', app_configuration)
      expect(selected_model).to eq(mock_model_b)
    end
  end

  describe '#clean_ai_providers!' do
    let(:mock_model_a) do
      Class.new(Analysis::LLM::Base) { define_method(:family) { 'family_a' } }
    end
    let(:mock_family_a) { described_class::LLMFamily.new(key: 'family_a', name: 'Family A', description: 'Test family A') }
    let(:mock_use_case) do
      described_class::LLMUseCase.new(
        key: 'valid_use_case',
        description: 'Valid use case',
        supported_models: [mock_model_a],
        default_model: mock_model_a
      )
    end

    before do
      stub_const('LLMSelector::FAMILIES', [mock_family_a])
      stub_const('LLMSelector::MODELS', [mock_model_a])
      stub_const('LLMSelector::USE_CASES', [mock_use_case])
    end

    it 'removes unsupported use cases from the app configuration, without touching existing supported ones' do
      ai_providers_config = {
        'valid_use_case' => 'family_a',
        'invalid_use_case' => 'family_a'
      }
      app_configuration = instance_double(AppConfiguration)
      allow(app_configuration).to receive(:settings).with('core', 'ai_providers').and_return(ai_providers_config)

      service.clean_ai_providers!(app_configuration)

      expect(ai_providers_config).to eq({ 'valid_use_case' => 'family_a' })
    end

    it 'resets unsupported families to auto, without touching existing supported ones' do
      ai_providers_config = {
        'valid_use_case' => 'invalid_family'
      }
      app_configuration = instance_double(AppConfiguration)
      allow(app_configuration).to receive(:settings).with('core', 'ai_providers').and_return(ai_providers_config)

      service.clean_ai_providers!(app_configuration)

      expect(ai_providers_config).to eq({ 'valid_use_case' => 'auto' })
    end

    it 'returns early when ai_providers config is blank' do
      app_configuration = instance_double(AppConfiguration)
      allow(app_configuration).to receive(:settings).with('core', 'ai_providers').and_return({})

      result = service.clean_ai_providers!(app_configuration)

      expect(result).to be_nil
    end
  end
end

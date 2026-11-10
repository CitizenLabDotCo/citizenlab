# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Skill do
  let(:fixtures_root) { Rails.root.join('spec/fixtures/llm_skills/plugins') }

  before { stub_const("#{described_class}::ROOT", fixtures_root) }

  describe '.available?' do
    using RSpec::Parameterized::TableSyntax

    where(:env, :synced, :available) do
      'development' | true  | true
      'development' | false | false
      'production'  | true  | false
    end

    with_them do
      before do
        allow(Rails).to receive(:env).and_return(ActiveSupport::EnvironmentInquirer.new(env))
        stub_const("#{described_class}::ROOT", Rails.root.join('spec/fixtures/missing')) unless synced
      end

      it { expect(described_class.available?).to be(available) }
    end
  end

  it 'reads the files of a skill and the shared files of its plugin' do
    skill = described_class.find('example-skill')

    expect(skill.name).to eq('example-skill')
    expect(skill.files.keys).to eq(['SKILL.md', 'references/guide.md', '../../shared/style.md'])
    expect(skill.files['SKILL.md']).to start_with('# Example skill')
    expect(skill.files['../../shared/style.md']).to include('Fixture guidance on style.')
  end

  it 'finds no skill that is not synced' do
    expect(described_class.find('unknown-skill')).to be_nil
  end
end

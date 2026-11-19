# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Skill do
  let(:missing_root) { Rails.root.join('spec/fixtures/missing') }

  describe '.available?' do
    it 'is true when the skills folder is there' do
      expect(described_class.available?).to be(true)
    end

    it 'is false when the skills folder is not there' do
      stub_const("#{described_class}::ROOT", missing_root)

      expect(described_class.available?).to be(false)
    end
  end

  describe '.find' do
    using RSpec::Parameterized::TableSyntax

    where(:env, :copied, :name, :found, :reported) do
      'production'  | true  | 'example-skill' | true  | false
      'production'  | true  | 'unknown-skill' | false | true
      'development' | true  | 'unknown-skill' | false | false
      'production'  | false | 'example-skill' | false | false
    end

    with_them do
      before do
        allow(Rails).to receive(:env).and_return(ActiveSupport::EnvironmentInquirer.new(env))
        stub_const("#{described_class}::ROOT", missing_root) unless copied
        allow(ErrorReporter).to receive(:report_msg)
      end

      it 'finds a copied skill, and reports a missing one outside development' do
        expect(described_class.find(name).present?).to be(found)

        if reported
          expect(ErrorReporter).to have_received(:report_msg).with('LLM skill not found', extra: { name: })
        else
          expect(ErrorReporter).not_to have_received(:report_msg)
        end
      end
    end
  end

  it 'reads the files of a skill and the shared files of its plugin' do
    skill = described_class.find('example-skill')

    expect(skill.name).to eq('example-skill')
    expect(skill.files.keys).to eq(['SKILL.md', 'references/guide.md', '../../shared/style.md'])
    expect(skill.files['SKILL.md']).to start_with('# Example skill')
    expect(skill.files['../../shared/style.md']).to include('Fixture guidance on style.')
  end

  it 'lists the skill of every surface in the manifest, so CI puts it in the image' do
    manifest = YAML.load_file(Rails.root.join('config/llm_skills.yml'))

    expect(manifest['skills']).to include(*AIAssistant::Surface.all.filter_map(&:skill_name))
  end
end

# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'demos:translate_analysis_tags rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['demos:translate_analysis_tags'].reenable
    # The task writes its JSON report to the working directory.
    FileUtils.rm_f(Rails.root.join('translate_analysis_tags.json'))
  end

  def run_task(execute: false, host: Tenant.current.host, locale: 'nl-NL')
    Rake::Task['demos:translate_analysis_tags'].invoke(host, locale, execute ? 'execute' : nil)
  end

  let(:project) { create(:single_phase_ideation_project) }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
  let(:analysis) do
    create(:analysis, main_custom_field: nil, additional_custom_fields: custom_form.custom_fields, project: project)
  end

  describe 'argument validation' do
    it 'aborts when no host is given' do
      expect { run_task(host: nil) }.to output(/Both host and locale arguments are required/).to_stdout
    end

    it 'aborts when no locale is given' do
      expect { run_task(locale: nil) }.to output(/Both host and locale arguments are required/).to_stdout
    end

    it 'aborts when no tenant matches the host' do
      expect { run_task(host: 'does-not-exist.example.com') }.to output(/No tenant found/).to_stdout
    end

    it 'aborts when the locale is not configured on the tenant' do
      create(:tag, tag_type: 'nlp_topic', analysis: analysis, name: 'Affordable Housing')

      expect { run_task(execute: false, locale: 'de-DE') }.to output(/does not have locale 'de-DE' configured/).to_stdout
      expect(analysis.tags.where(tag_type: 'nlp_topic').pluck(:name)).to eq(['Affordable Housing'])
    end
  end

  describe 'dry-run mode' do
    it 'does not delete existing nlp_topic tags' do
      create(:tag, tag_type: 'nlp_topic', analysis: analysis, name: 'Affordable Housing')

      run_task(execute: false)

      expect(analysis.tags.where(tag_type: 'nlp_topic').pluck(:name)).to eq(['Affordable Housing'])
    end

    it 'reports the tags that would be regenerated' do
      create(:tag, tag_type: 'nlp_topic', analysis: analysis, name: 'Affordable Housing')

      expect { run_task(execute: false) }.to output(/WOULD DELETE 1 nlp_topic tags: Affordable Housing/).to_stdout
    end
  end

  describe 'lifecycle guard' do
    # The default test tenant has lifecycle_stage 'active', and tests run outside the
    # development env, so execute mode is blocked here.
    it 'refuses to apply changes on a non-demo tenant outside development' do
      create(:tag, tag_type: 'nlp_topic', analysis: analysis, name: 'Affordable Housing')

      expect { run_task(execute: true) }.to output(/Execute mode is only allowed on demo platforms/).to_stdout
      expect(analysis.tags.where(tag_type: 'nlp_topic').pluck(:name)).to eq(['Affordable Housing'])
    end

    it 'still allows a dry run on a non-demo tenant' do
      create(:tag, tag_type: 'nlp_topic', analysis: analysis, name: 'Affordable Housing')

      expect { run_task(execute: false) }.to output(/WOULD DELETE/).to_stdout
    end
  end

  # Execute mode only applies changes on demo platforms or in development, and the real
  # nlp_topic run uses a thread pool (so no transactional fixtures).
  describe 'execute mode', use_transactional_fixtures: false do
    before do
      # The default test tenant is 'active' and the model forbids flipping it to 'demo', so
      # stub the lifecycle_stage the guard reads (passing other settings lookups through).
      allow_any_instance_of(AppConfiguration).to receive(:settings).and_call_original
      allow_any_instance_of(AppConfiguration)
        .to receive(:settings).with('core', 'lifecycle_stage').and_return('demo')
    end

    def stub_topic_modeling(topics:, classification:)
      topics_response = topics.map { |t| "- #{t}" }.join("\n")
      allow_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return(topics_response)
      allow_any_instance_of(Analysis::LLM::GPT4oMini).to receive(:chat).and_return(*classification)
    end

    it 'deletes the English nlp_topic tags and regenerates them in the target locale' do
      create_list(:idea, 2, project: project)
      create(:tag, tag_type: 'nlp_topic', analysis: analysis, name: 'Affordable Housing')
      stub_topic_modeling(topics: ['Betaalbare woningen'], classification: ['Betaalbare woningen', 'Betaalbare woningen'])

      run_task(execute: true)

      nlp_names = analysis.tags.where(tag_type: 'nlp_topic').pluck(:name)
      expect(nlp_names).to eq(['Betaalbare woningen'])
    end

    it 'forces topic generation into the requested locale' do
      create(:idea, project: project)
      create(:tag, tag_type: 'nlp_topic', analysis: analysis, name: 'Affordable Housing')

      # The topic-modeling prompt instructs the LLM to write in the locale's language.
      expect_any_instance_of(Analysis::LLM::GPT41)
        .to receive(:chat).with(/Dutch/).and_return('- Betaalbare woningen')
      allow_any_instance_of(Analysis::LLM::GPT4oMini).to receive(:chat).and_return('Betaalbare woningen')

      run_task(execute: true)
    end

    it 'leaves other tag types untouched' do
      create(:idea, project: project)
      create(:tag, tag_type: 'nlp_topic', analysis: analysis, name: 'Affordable Housing')
      sentiment_tag = create(:tag, tag_type: 'sentiment', analysis: analysis, name: 'sentiment +')
      stub_topic_modeling(topics: ['Betaalbare woningen'], classification: ['Betaalbare woningen'])

      run_task(execute: true)

      expect(Analysis::Tag.exists?(sentiment_tag.id)).to be(true)
    end

    it 'does nothing for analyses without nlp_topic tags' do
      create(:idea, project: project)
      create(:tag, tag_type: 'sentiment', analysis: analysis, name: 'sentiment +')

      expect_any_instance_of(Analysis::LLM::GPT41).not_to receive(:chat)

      run_task(execute: true)
    end
  end
end
# rubocop:enable RSpec/DescribeClass

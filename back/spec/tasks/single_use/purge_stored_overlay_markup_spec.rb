# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:purge_stored_overlay_markup rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:purge_stored_overlay_markup'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:report_path) { Rails.root.join('purge_stored_overlay_markup.json') }
  let(:dry_run_report_path) { Rails.root.join('purge_stored_overlay_markup_dry_run.json') }
  let(:wistia) { 'https://fast.wistia.com/embed/iframe/x' }
  let(:overlay) { %(<iframe class="ql-video sc-bmToVj cWOqIK" src="#{wistia}" style="width:100%;height:100vh;"></iframe>) }
  let(:cleaned) { %(<iframe class="ql-video" src="#{wistia}" style="width:100%;"></iframe>) }

  def run_task(dry_run: false)
    Rake::Task['single_use:purge_stored_overlay_markup'].invoke(dry_run ? nil : 'execute')
  end

  def report
    JSON.parse(File.read(report_path))
  end

  # Models sanitize on write, so content saved before the fix has to be stored past the callbacks.
  def store_raw(record, attribute, value)
    record.update_column(attribute, value)
    record
  end

  context 'an idea body with an iframe covering the page' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => "<p>x</p>#{overlay}" }) }

    it 'keeps the video without the app classes and the viewport size' do
      run_task
      expect(idea.reload.body_multiloc['en']).to eq "<p>x</p>#{cleaned}"
    end

    it 'lists it apart as a likely payload' do
      expect { run_task(dry_run: true) }.to output(/Likely payloads.*Idea#body_multiloc.*#{idea.id}/m).to_stdout
    end
  end

  context 'an iframe that is not a real video' do
    let!(:idea) do
      store_raw(create(:idea), :body_multiloc, { 'en' => '<p>x</p><iframe class="ql-video" src="https://evil.com/#/wistia.com/"></iframe>' })
    end

    it 'removes it and lists it as a likely payload' do
      expect { run_task }.to output(/Likely payloads.*Idea#body_multiloc.*#{idea.id}/m).to_stdout
      expect(idea.reload.body_multiloc['en']).to eq '<p>x</p>'
    end
  end

  # Over 10 MB, libxml2 drops the attribute and everything after it, so re-sanitizing would cut
  # the text short.
  context 'a row the sanitizer would cut short' do
    let(:body) { %(<img src="data:image/png;base64,#{'A' * 11_000_000}" class="sc-x"><p>text after</p>) }
    let!(:event) { store_raw(create(:event), :description_multiloc, { 'en' => body }) }

    it 'is left as it is and listed' do
      expect { run_task }.to output(/content would be lost.*Event#description_multiloc #{event.id}/m).to_stdout
      expect(event.reload.description_multiloc['en']).to eq body
      expect(report['changes']).to be_empty
    end
  end

  context 'a row whose trailing non-breaking space the write path trims' do
    let(:body) { '<p class="sc-x">x</p><p>&nbsp;</p>' }
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => body }) }

    it 'is left as it is and counted, not listed as losing text' do
      expect { run_task }.to output(
        a_string_including('Idea#body_multiloc: 1').and(satisfy { |out| out.exclude?('content would be lost') })
      ).to_stdout
      expect(idea.reload.body_multiloc['en']).to eq body
    end
  end

  # Campaigns were only sanitized on write from some point on, so older bodies hold tags the
  # write path now drops.
  context 'an older campaign body with a tag the write path drops' do
    let(:body) { '<h1>Title</h1><p class="sc-x">x</p>' }
    let!(:campaign) { store_raw(create(:manual_campaign), :body_multiloc, { 'en' => body }) }

    it 'is left as it is and counted' do
      expect { run_task }.to output(/EmailCampaigns::Campaign#body_multiloc: 1/).to_stdout
      expect(campaign.reload.body_multiloc['en']).to eq body
      expect(report['changes']).to be_empty
    end
  end

  context 'an older campaign body with a tag the write path drops and an overlay' do
    let!(:campaign) { store_raw(create(:manual_campaign), :body_multiloc, { 'en' => "<h1>Title</h1>#{overlay}" }) }

    it 'is listed by id, since it is not cleaned' do
      expect { run_task(dry_run: true) }
        .to output(/looks like a payload, to clean by hand:\n.*EmailCampaigns::Campaign#body_multiloc #{campaign.id}/).to_stdout
    end
  end

  context 'an editor class split by machine translation' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<p class="ql-align -justify">x</p>' }) }

    it 'drops the broken class without listing it as a payload' do
      expect { run_task }.not_to output(/Likely payloads/).to_stdout
      expect(idea.reload.body_multiloc['en']).to eq '<p>x</p>'
    end
  end

  context 'content pasted from a word processor' do
    let!(:phase) do
      store_raw(create(:phase), :description_multiloc, {
        'en' => '<p class="MsoNormal" style="margin:9.75pt 0cm;background-position:initial;">x</p>'
      })
    end

    it 'drops its classes and styles without listing it as a payload' do
      expect { run_task }.not_to output(/Likely payloads/).to_stdout
      expect(phase.reload.description_multiloc['en']).to eq '<p>x</p>'
    end
  end

  context 'text pasted with its own classes' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<p class="p1">x</p><p class="x_elementtoproof">y</p>' }) }

    it 'drops them without listing the row for review' do
      expect { run_task }.not_to output(/Likely payloads/).to_stdout
      expect(idea.reload.body_multiloc['en']).to eq '<p>x</p><p>y</p>'
    end
  end

  context 'a comment link with app classes' do
    it 'is listed for review' do
      comment = store_raw(create(:comment), :body_multiloc, { 'en' => '<a href="https://e.com" class="sc-x">https://e.com</a>' })
      expect { run_task(dry_run: true) }.to output(/Likely payloads.*Comment#body_multiloc.*#{comment.id}/m).to_stdout
    end
  end

  context 'a comment link with app classes, cleaned' do
    let!(:comment) do
      store_raw(create(:comment), :body_multiloc, { 'en' => '<a href="https://e.com" class="sc-x">https://e.com</a>' })
    end

    it 'keeps the link without its class' do
      run_task
      expect(comment.reload.body_multiloc['en'])
        .to eq '<a href="https://e.com" target="_blank" rel="noreferrer noopener nofollow">https://e.com</a>'
    end
  end

  context 'a content builder text with an iframe covering the page' do
    let!(:layout) { store_raw(create(:layout), :craftjs_json, craftjson_with_text(overlay)) }

    it 'cleans the text of the widget' do
      run_task
      expect(layout.reload.craftjs_json.dig('text-node', 'props', 'text', 'en')).to eq cleaned
    end
  end

  context 'what the editor writes' do
    let(:body) do
      <<~HTML.squish
        <p class="ql-align-center">centered</p>
        <iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Embedded video" width="242px" height="121px" style="display:block;margin:auto;" data-align="center"></iframe>
      HTML
    end
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => body }) }

    it 'is left untouched and reported as no change' do
      expect { run_task }.not_to(change { idea.reload.body_multiloc })
      expect(report['changes']).to be_empty
      # Without this the example would also pass if the task had failed on every tenant.
      expect(report['errors']).to be_empty
      expect(report['processed_tenants']).to include(Tenant.current.host)
    end
  end

  context 'a dry run' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => overlay }) }

    it 'writes nothing but still reports the change it would make' do
      expect { run_task(dry_run: true) }.not_to(change { idea.reload.body_multiloc })
      expect(File).not_to exist(report_path)
      expect(JSON.parse(File.read(dry_run_report_path))['changes']).not_to be_empty
    end
  end

  context 'when the task is run twice' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => overlay }) }

    it 'has nothing to do on the second run' do
      run_task
      Rake::Task['single_use:purge_stored_overlay_markup'].reenable

      expect { run_task }.not_to(change { idea.reload.body_multiloc })
      expect(report['changes']).to be_empty
    end
  end

  def craftjson_with_text(text)
    {
      'ROOT' => {
        'type' => 'div', 'isCanvas' => true, 'props' => { 'id' => 'e2e-content-builder-frame' },
        'displayName' => 'div', 'custom' => {}, 'hidden' => false, 'nodes' => ['text-node'], 'linkedNodes' => {}
      },
      'text-node' => {
        'type' => { 'resolvedName' => 'TextMultiloc' }, 'isCanvas' => false,
        'props' => { 'text' => { 'en' => text }, 'id' => 'text' },
        'displayName' => 'TextMultiloc', 'custom' => {}, 'parent' => 'ROOT', 'hidden' => false,
        'nodes' => [], 'linkedNodes' => {}
      }
    }
  end
end
# rubocop:enable RSpec/DescribeClass

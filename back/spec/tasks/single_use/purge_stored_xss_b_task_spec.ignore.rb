# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:purge_stored_xss_b rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:purge_stored_xss_b'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:report_path) { Rails.root.join('purge_stored_xss_b.json') }
  let(:dry_run_report_path) { Rails.root.join('purge_stored_xss_b_dry_run.json') }

  def run_task(dry_run: false, host: nil)
    Rake::Task['single_use:purge_stored_xss_b'].invoke(dry_run ? nil : 'execute', host)
  end

  def report
    JSON.parse(File.read(report_path))
  end

  # Models sanitise on write now, so a legacy payload has to be stored past the callbacks.
  def store_raw(record, attribute, value)
    record.update_column(attribute, value)
    record
  end

  # Execute mode asks about every row where sanitising costs content, and refuses to guess without a
  # terminal. Give it one that answers.
  def answering(*replies)
    allow($stdin).to receive(:tty?).and_return(true)
    allow($stdin).to receive(:gets).and_return(*replies.map { |reply| "#{reply}\n" })
  end

  # The plain-text columns of models whose `title_multiloc` `purge_stored_xss` already swept, plus
  # the one column it never had a model for at all.
  context 'the plain-text columns the earlier task left behind' do
    let!(:phase) { create(:phase) }
    let!(:event) { create(:event) }
    let!(:static_page) { create(:static_page) }
    let!(:official_feedback) { create(:official_feedback) }

    let(:columns) do
      {
        phase => %i[native_survey_title_multiloc native_survey_button_multiloc],
        event => %i[location_multiloc address_2_multiloc attend_button_multiloc],
        static_page => %i[banner_header_multiloc banner_subheader_multiloc banner_cta_button_multiloc],
        official_feedback => %i[author_multiloc]
      }
    end

    before do
      columns.each do |record, attributes|
        attributes.each { |attribute| store_raw(record, attribute, { 'en' => '<img src=x onerror=alert(1)>hi' }) }
      end
    end

    it 'strips all HTML from each of them' do
      run_task
      columns.each do |record, attributes|
        record.reload
        attributes.each { |attribute| expect(record[attribute]['en']).to eq 'hi' }
      end
    end

    it 'reports each one under its own model and attribute' do
      run_task
      pairs = report['changes'].map { |change| [change.dig('context', 'model'), change.dig('context', 'attribute')] }
      expect(pairs).to include(
        %w[Phase native_survey_title_multiloc],
        %w[Event location_multiloc],
        %w[StaticPage banner_header_multiloc],
        %w[OfficialFeedback author_multiloc]
      )
    end
  end

  context 'the remaining title models' do
    let!(:records) do
      {
        space: store_raw(create(:space), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        area: store_raw(create(:area), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        group: store_raw(create(:group), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        idea_status: store_raw(create(:idea_status), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        nav_bar_item: store_raw(create(:nav_bar_item), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        option: store_raw(create(:custom_field_option), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        statement: store_raw(create(:custom_field_matrix_statement), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        poll_question: store_raw(create(:poll_question), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        poll_option: store_raw(create(:poll_option), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        layer: store_raw(create(:layer), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }),
        cause: store_raw(create(:cause), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' })
      }
    end

    it 'strips all HTML from each of them' do
      run_task
      records.each_value { |record| expect(record.reload.title_multiloc['en']).to eq 'hi' }
    end
  end

  # `purge_stored_xss` swept these and has already been run on production, so re-sanitising them
  # here would rewrite rows a second time for nothing.
  context 'the fields the earlier task already swept' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<p>x</p><img src=x onerror=alert(1)>' }) }
    let!(:comment) { store_raw(create(:comment), :body_multiloc, { 'en' => '<p>hi</p><script>alert(1)</script>' }) }
    let!(:project) { store_raw(create(:project), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }
    let!(:machine_translation) do
      store_raw(create(:machine_translation, attribute_name: 'body_multiloc'), :translation, '<p>hi</p><img src=x onerror=alert(1)>')
    end

    before { store_raw(idea, :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }

    it 'is left alone' do
      run_task
      expect(idea.reload[:body_multiloc]['en']).to eq '<p>x</p><img src=x onerror=alert(1)>'
      expect(idea.reload[:title_multiloc]['en']).to eq '<img src=x onerror=alert(1)>hi'
      expect(comment.reload[:body_multiloc]['en']).to eq '<p>hi</p><script>alert(1)</script>'
      expect(project.reload[:title_multiloc]['en']).to eq '<img src=x onerror=alert(1)>hi'
      expect(machine_translation.reload.translation).to eq '<p>hi</p><img src=x onerror=alert(1)>'
    end

    it 'reports no change for any of them' do
      run_task
      expect(report['changes']).to be_empty
    end
  end

  # Their own task sweeps these, so a payload here must survive this one untouched.
  context 'a custom field title or a campaign subject carrying HTML' do
    let!(:custom_field) { store_raw(create(:custom_field), :title_multiloc, { 'en' => '<b>Age</b>' }) }
    let!(:campaign) { store_raw(create(:manual_campaign), :subject_multiloc, { 'en' => '<b>News</b>' }) }

    it 'is left alone' do
      run_task
      expect(custom_field.reload[:title_multiloc]['en']).to eq '<b>Age</b>'
      expect(campaign.reload[:subject_multiloc]['en']).to eq '<b>News</b>'
    end
  end

  # Rich text, rendered with `dangerouslySetInnerHTML` on the feed sidebar, and sanitised on write
  # only from TAN-8413 onwards - so anything stored before that has never been through a sanitiser.
  context 'a topic description carrying a payload' do
    let!(:input_topic) do
      store_raw(create(:input_topic), :description_multiloc,
        { 'en' => '<p>About <b>housing</b></p><img src=x onerror=alert(1)>' })
    end
    let!(:global_topic) do
      store_raw(create(:global_topic), :description_multiloc, { 'en' => '<p>hi</p><script>alert(1)</script>' })
    end
    let!(:default_topic) do
      store_raw(create(:default_input_topic), :description_multiloc, { 'en' => '<h2>Big</h2><p>hi</p>' })
    end

    it 'strips the payload and keeps the formatting the editor can produce' do
      run_task
      expect(input_topic.reload[:description_multiloc]['en']).to eq '<p>About <b>housing</b></p>'
      expect(global_topic.reload[:description_multiloc]['en']).to eq '<p>hi</p>alert(1)'
      expect(default_topic.reload[:description_multiloc]['en']).to eq 'Big<p>hi</p>'
    end

    it 'reports each one under its own model' do
      run_task
      models = report['changes'].filter_map do |change|
        change.dig('context', 'model') if change.dig('context', 'attribute') == 'description_multiloc'
      end
      expect(models).to include('InputTopic', 'GlobalTopic', 'DefaultInputTopic')
    end
  end

  # Sanitised rather than stripped: it is rendered with `dangerouslySetInnerHTML`.
  context 'an access denied explanation carrying a payload' do
    let!(:permission) do
      store_raw(create(:permission), :access_denied_explanation_multiloc,
        { 'en' => '<p>Ask your <b>council</b></p><img src=x onerror=alert(1)>' })
    end

    it 'strips the payload and keeps the formatting' do
      run_task
      expect(permission.reload.access_denied_explanation_multiloc['en']).to eq '<p>Ask your <b>council</b></p>'
    end

    it 'records the change with context' do
      run_task
      change = report['changes'].find { |c| c.dig('context', 'model') == 'Permission' }
      expect(change['context']).to include(
        'model' => 'Permission', 'id' => permission.id, 'attribute' => 'access_denied_explanation_multiloc'
      )
      expect(change['new_value']['en']).to eq '<p>Ask your <b>council</b></p>'
    end
  end

  # The explanation allows links, so removing a payload must not cost it the ones an author wrote.
  context 'an access denied explanation carrying both a payload and a link' do
    let!(:permission) do
      store_raw(create(:permission), :access_denied_explanation_multiloc, { 'en' =>
        '<p>See <a href="https://example.com" target="_blank" rel="noreferrer noopener nofollow">https://example.com</a></p><img src=x onerror=alert(1)>' })
    end

    it 'strips the payload and keeps the link' do
      run_task
      explanation = permission.reload.access_denied_explanation_multiloc['en']
      expect(explanation).to include('href="https://example.com"')
      expect(explanation).not_to include('onerror')
    end
  end

  # A link inside a raw-text element is text to the parser, so stripping that element takes the
  # destination with it while the words around it stay put - the one damage the word check misses.
  context 'an explanation whose link is swallowed with the element around it' do
    let!(:permission) do
      store_raw(create(:permission), :access_denied_explanation_multiloc,
        { 'en' => '<style><a href="https://example.com/docs">docs</a></style>' })
    end

    it 'reports the destination it would lose' do
      expect { run_task(dry_run: true) }.to output(
        %r{Links that now point elsewhere.*was: https://example\.com/docs}m
      ).to_stdout
    end
  end

  # Stripping a plain-text column drops every anchor by definition, so checking those for moved
  # links would report every link that ever existed and bury the rest.
  context 'a plain-text column carrying a link' do
    let!(:static_page) do
      store_raw(create(:static_page), :banner_header_multiloc, { 'en' => '<a href="https://example.com/docs">docs</a>' })
    end

    it 'is not reported as a moved link' do
      expect { run_task(dry_run: true) }.not_to output(/Links that now point elsewhere/).to_stdout
    end
  end

  # None of these contain an executable keyword, but the write path strips all of them - so the
  # pre-filter has to be wide enough to find them.
  context 'payloads that carry no executable keyword' do
    {
      'iframe with a non-allowlisted src' => '<iframe src="https://evil.example"></iframe>',
      'form and input' => '<form action="https://evil.example"><input name="pw"></form>',
      'object' => '<object data="https://evil.example"></object>',
      'style block' => '<style>body{display:none}</style>',
      'entity-encoded scheme' => '<a href="javas&#99;ript:alert(1)">x</a>'
    }.each do |label, payload|
      context "an access denied explanation carrying #{label}" do
        let!(:permission) do
          store_raw(create(:permission), :access_denied_explanation_multiloc, { 'en' => "<p>hi</p>#{payload}" })
        end

        it 'is found by the pre-filter and rewritten' do
          expect { run_task }.to(change { permission.reload[:access_denied_explanation_multiloc] })
        end
      end
    end
  end

  # Sanitising a value that was nothing but payload leaves nothing. `update_columns` goes around the
  # presence validation, so a blank would freeze the record - every later save of any field on it
  # fails on the missing title. The placeholder keeps it saveable.
  context 'a title that is nothing but a payload' do
    let!(:area) { store_raw(create(:area), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>' }) }

    it 'writes the placeholder once confirmed, not the blank the record rejects' do
      answering 'y'
      run_task
      expect(area.reload.title_multiloc['en']).to eq '-'
      expect(area.reload).to be_valid
    end

    it 'leaves the row alone when skipped' do
      answering 's'
      expect { run_task }.not_to(change { area.reload.title_multiloc })
    end

    it 'names the tenant, model and id in the summary, with the value it would replace' do
      expect { run_task(dry_run: true) }.to output(
        /Emptied.*#{Regexp.escape(Tenant.current.host)}.*Area#title_multiloc \[en\] #{area.id}.*before: <img src=x onerror=alert\(1\)>/m
      ).to_stdout
    end

    # Skipping leaves a live payload and writing may cost content, so guessing is the one thing it
    # must not do.
    it 'aborts rather than deciding for itself when there is no terminal' do
      allow($stdin).to receive(:tty?).and_return(false)
      expect { run_task }.to raise_error(SystemExit)
    end
  end

  # `Event#location_multiloc` declares `presence: false`, so a blank is a legal state and inventing
  # content for it would be worse than leaving it.
  context 'a value that is nothing but a payload, where a blank is legal' do
    let!(:event) { store_raw(create(:event), :location_multiloc, { 'en' => '<object data="https://evil.example"></object>' }) }

    it 'writes the blank rather than the placeholder' do
      answering 'y'
      run_task
      expect(event.reload[:location_multiloc]['en']).to eq ''
    end
  end

  # `<` followed by a letter opens a tag as far as the parser is concerned, so it swallows the rest
  # of the sentence. Nothing tells that apart from real markup, so the operator decides.
  context 'an explanation where sanitising swallows prose' do
    let!(:permission) do
      store_raw(create(:permission), :access_denied_explanation_multiloc,
        { 'en' => 'Sea (25 cm <Sea level <200 cm) and the polders.' })
    end

    it 'lists the words it would lose, with the value before and after' do
      expect { run_task(dry_run: true) }.to output(
        /Text lost outside a link.*lost: Sea, level, 200, cm, and, the, polders.*before: Sea \(25 cm <Sea level.*after:  Sea \(25 cm/m
      ).to_stdout
    end

    it 'writes the sanitised value once confirmed' do
      answering 'y'
      run_task
      expect(permission.reload.access_denied_explanation_multiloc['en']).to eq 'Sea (25 cm '
    end

    it 'leaves the row alone when skipped, and says so' do
      answering 's'
      expect { run_task }.to output(/Skipped on your say-so/).to_stdout
      expect(permission.reload.access_denied_explanation_multiloc['en']).to eq 'Sea (25 cm <Sea level <200 cm) and the polders.'
    end
  end

  # The closing tag gives the swallowed run a `>` to end on, so a tag pattern that reads to the next
  # `>` loses the same prose from the before-value and measures the loss as nothing.
  context 'an explanation where the swallowed prose is followed by a closing tag' do
    let!(:permission) do
      store_raw(create(:permission), :access_denied_explanation_multiloc,
        { 'en' => '<p>Invasion of the Sea (25 cm <Sea level <200 cm) and the polders.</p>' })
    end

    it 'still reports the words it would lose' do
      expect { run_task(dry_run: true) }.to output(
        /Text lost outside a link.*lost: Sea, level, 200, cm, and, the, polders/m
      ).to_stdout
    end
  end

  context 'clean content' do
    let!(:permission) { create(:permission, access_denied_explanation_multiloc: { 'en' => '<p>perfectly fine</p>' }) }

    it 'is left untouched and reported as no change' do
      expect { run_task }.not_to(change { permission.reload.access_denied_explanation_multiloc })
      expect(report['changes']).to be_empty
      # Without this the example would also pass if the task had errored on every tenant.
      expect(report['errors']).to be_empty
      expect(report['processed_tenants']).to include(Tenant.current.host)
    end
  end

  context 'a dry run' do
    let!(:static_page) { store_raw(create(:static_page), :banner_header_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }

    it 'writes nothing but still reports the change it would make' do
      expect { run_task(dry_run: true) }.not_to(change { static_page.reload[:banner_header_multiloc] })
      expect(File).not_to exist(report_path)
      dry_run_report = JSON.parse(File.read(dry_run_report_path))
      expect(dry_run_report['changes']).not_to be_empty
    end
  end

  context 'when the task is run twice' do
    let!(:static_page) { store_raw(create(:static_page), :banner_header_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }

    it 'has nothing to do on the second run' do
      run_task
      Rake::Task['single_use:purge_stored_xss_b'].reenable

      expect { run_task }.not_to(change { static_page.reload[:banner_header_multiloc] })
      expect(report['changes']).to be_empty
    end
  end
end
# rubocop:enable RSpec/DescribeClass

# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:purge_stored_xss rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:purge_stored_xss'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:report_path) { Rails.root.join('purge_stored_xss.json') }
  let(:dry_run_report_path) { Rails.root.join('purge_stored_xss_dry_run.json') }

  def run_task(dry_run: false, host: nil)
    Rake::Task['single_use:purge_stored_xss'].invoke(dry_run ? nil : 'execute', host)
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

  context 'an idea body carrying an event-handler payload' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<p>x</p><img src=x onerror=alert(1)>' }) }

    it 'strips the handler and keeps the rest of the body' do
      run_task
      expect(idea.reload.body_multiloc['en']).to eq '<p>x</p><img src="x">'
    end

    it 'records the change with context' do
      run_task
      change = report['changes'].find { |c| c.dig('context', 'model') == 'Idea' && c.dig('context', 'attribute') == 'body_multiloc' }
      expect(change['context']).to include('model' => 'Idea', 'id' => idea.id, 'attribute' => 'body_multiloc')
      expect(change['new_value']['en']).to eq '<p>x</p><img src="x">'
    end
  end

  context 'an idea title carrying HTML' do
    let!(:idea) { store_raw(create(:idea), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }

    it 'strips all HTML from the title' do
      run_task
      expect(idea.reload.title_multiloc['en']).to eq 'hi'
    end

    it 'does not entity-encode the text it leaves behind' do
      store_raw(idea, :title_multiloc, { 'en' => '<b>Fish</b> & chips' })
      run_task
      expect(idea.reload.title_multiloc['en']).to eq 'Fish & chips'
    end
  end

  context 'a project, phase or folder title carrying HTML' do
    let!(:project) { store_raw(create(:project), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }
    let!(:phase) { store_raw(create(:phase), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }
    let!(:folder) { store_raw(create(:project_folder), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }

    it 'strips all HTML from each of them' do
      run_task
      [project, phase, folder].each do |record|
        expect(record.reload.title_multiloc['en']).to eq 'hi'
      end
    end

    it 'reports each one under its own model' do
      run_task
      models = report['changes'].filter_map { |c| c.dig('context', 'model') if c.dig('context', 'attribute') == 'title_multiloc' }
      expect(models).to include('Project', 'Phase', 'ProjectFolders::Folder')
    end
  end

  context 'a topic title carrying HTML' do
    let!(:input_topic) { store_raw(create(:input_topic), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }
    let!(:global_topic) { store_raw(create(:global_topic), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }
    let!(:default_topic) { store_raw(create(:default_input_topic), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }

    it 'strips all HTML from each topic model' do
      run_task
      [input_topic, global_topic, default_topic].each do |record|
        expect(record.reload.title_multiloc['en']).to eq 'hi'
      end
    end
  end

  context 'an event or static page title carrying HTML' do
    let!(:event) { store_raw(create(:event), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }
    let!(:static_page) { store_raw(create(:static_page), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }

    it 'strips all HTML from each of them' do
      run_task
      [event, static_page].each do |record|
        expect(record.reload.title_multiloc['en']).to eq 'hi'
      end
    end
  end

  context 'a comment body carrying a script tag' do
    let!(:comment) { store_raw(create(:comment), :body_multiloc, { 'en' => '<p>hi</p><script>alert(1)</script>' }) }

    # The script tag goes; its text content stays, inert.
    it 'strips the script and keeps the rest of the body' do
      run_task
      expect(comment.reload.body_multiloc['en']).to eq '<p>hi</p>alert(1)'
    end
  end

  # A comment body allows mentions only, so sanitising alone would strip the anchors linkify puts
  # there on write. Removing a payload must not cost the comment its links.
  context 'a comment body carrying both a payload and a link' do
    let!(:comment) do
      store_raw(create(:comment), :body_multiloc, { 'en' =>
        '<p>See <a href="https://example.com" target="_blank" rel="noreferrer noopener nofollow">https://example.com</a></p><img src=x onerror=alert(1)>' })
    end

    it 'strips the payload and keeps the link' do
      run_task
      expect(comment.reload.body_multiloc['en']).to eq(
        '<p>See <a href="https://example.com" target="_blank" rel="noreferrer noopener nofollow">https://example.com</a></p>'
      )
    end
  end

  # Mentions stored before April 2026 carry a `data-user-slug` the write path no longer keeps.
  # Nothing reads it, so stripping it would rewrite a row that carries no payload.
  context 'a comment body whose only rewrite is the dead mention attribute' do
    let!(:comment) { store_raw(create(:comment), :body_multiloc, { 'en' => '<p><span class="cl-mention-user" data-user-id="159cfd0a-44d1-4e87-9bdc-f158d7c0d16e" data-user-slug="tesha-bergstrom">@Tesha Bergstrom</span> hi</p>' }) }

    it 'leaves the row alone' do
      expect { run_task }.not_to(change { comment.reload.body_multiloc })
    end

    it 'reports no change for it' do
      run_task
      expect(report['changes']).to be_empty
    end
  end

  context 'a comment body carrying the dead mention attribute alongside a payload' do
    let!(:comment) do
      store_raw(create(:comment), :body_multiloc, { 'en' => '<p><span class="cl-mention-user" data-user-id="159cfd0a-44d1-4e87-9bdc-f158d7c0d16e" data-user-slug="tesha-bergstrom">@Tesha Bergstrom</span> hi</p><script>alert(1)</script>' })
    end

    # Skipping is for rows that change in no other way; a row with a payload is purged, and the dead
    # attribute goes with it because the write path no longer keeps it.
    it 'purges it and drops the attribute too' do
      run_task
      expect(comment.reload.body_multiloc['en']).to eq '<p><span class="cl-mention-user" data-user-id="159cfd0a-44d1-4e87-9bdc-f158d7c0d16e">@Tesha Bergstrom</span> hi</p>alert(1)'
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
      context "an idea body carrying #{label}" do
        let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => "<p>hi</p>#{payload}" }) }

        it 'is found by the pre-filter and rewritten' do
          expect { run_task }.to(change { idea.reload.body_multiloc })
        end
      end
    end
  end

  context 'a machine translation carrying an event-handler payload' do
    let!(:mt) do
      store_raw(create(:machine_translation, attribute_name: 'body_multiloc'), :translation, '<p>hi</p><img src=x onerror=alert(1)>')
    end

    it 'strips the handler and keeps the rest of the translation' do
      run_task
      expect(mt.reload.translation).to eq '<p>hi</p><img src="x">'
    end
  end

  # Sanitising a value that was nothing but payload leaves nothing. `update_columns` goes around the
  # presence validation, so a blank would freeze the record - every later save of any field on it
  # fails on the missing title. The placeholder keeps it saveable.
  context 'a title that is nothing but a payload' do
    let!(:project) { store_raw(create(:project), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>' }) }

    it 'writes the placeholder once confirmed, not the blank the record rejects' do
      answering 'y'
      run_task
      expect(project.reload.title_multiloc['en']).to eq '-'
      expect(project.reload).to be_valid
    end

    it 'leaves the row alone when skipped' do
      answering 's'
      expect { run_task }.not_to(change { project.reload.title_multiloc })
    end

    it 'names the tenant, model and id in the summary, with the value it would replace' do
      expect { run_task(dry_run: true) }.to output(
        /Emptied.*#{Regexp.escape(Tenant.current.host)}.*Project#title_multiloc \[en\] #{project.id}.*before: <img src=x onerror=alert\(1\)>/m
      ).to_stdout
    end

    # Skipping leaves a live payload and writing may cost content, so guessing is the one thing it
    # must not do.
    it 'aborts rather than deciding for itself when there is no terminal' do
      allow($stdin).to receive(:tty?).and_return(false)
      expect { run_task }.to raise_error(SystemExit)
    end
  end

  # `Idea#body_multiloc` is the one swept field declaring `presence: false`, so a blank is a legal
  # state and inventing content for it would be worse than leaving it.
  context 'an idea body that is nothing but a payload' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<object data="https://evil.example"></object>' }) }

    it 'writes the blank rather than the placeholder' do
      answering 'y'
      run_task
      expect(idea.reload.body_multiloc['en']).to eq ''
    end
  end

  # `<` followed by a letter opens a tag as far as the parser is concerned, so it swallows the rest
  # of the sentence. Nothing tells that apart from real markup, so the operator decides.
  context 'a body where sanitising swallows prose' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => 'Sea (25 cm <Sea level <200 cm) and the polders.' }) }

    it 'lists the words it would lose, with the value before and after' do
      expect { run_task(dry_run: true) }.to output(
        /Text lost outside a link.*lost: Sea, level, 200, cm, and, the, polders.*before: Sea \(25 cm <Sea level.*after:  Sea \(25 cm/m
      ).to_stdout
    end

    it 'writes the sanitised value once confirmed' do
      answering 'y'
      run_task
      expect(idea.reload.body_multiloc['en']).to eq 'Sea (25 cm '
    end

    it 'leaves the row alone when skipped, and says so' do
      answering 's'
      expect { run_task }.to output(/Skipped on your say-so/).to_stdout
      expect(idea.reload.body_multiloc['en']).to eq 'Sea (25 cm <Sea level <200 cm) and the polders.'
    end
  end

  # The closing tag gives the swallowed run a `>` to end on, so a tag pattern that reads to the next
  # `>` loses the same prose from the before-value and measures the loss as nothing.
  context 'a body where the swallowed prose is followed by a closing tag' do
    let!(:idea) do
      store_raw(create(:idea), :body_multiloc, { 'en' => '<p>Invasion of the Sea (25 cm <Sea level <200 cm) and the polders.</p>' })
    end

    it 'still reports the words it would lose' do
      expect { run_task(dry_run: true) }.to output(
        /Text lost outside a link.*lost: Sea, level, 200, cm, and, the, polders/m
      ).to_stdout
    end
  end

  # A translated label is replaced by its own href, so its words go by design. Flagging those would
  # bury the real losses - in the production dry run they outnumbered them 385 to 8.
  context 'a machine translation whose link label was translated' do
    let!(:mt) do
      store_raw(
        create(:machine_translation, translatable: create(:comment), attribute_name: 'body_multiloc'), :translation,
        '<a href="https://example.com/x" target="_blank" rel="noreferrer noopener nofollow">klik hier</a>'
      )
    end

    it 'is not flagged as lost text' do
      expect { run_task(dry_run: true) }.not_to output(/Text lost outside a link/).to_stdout
    end

    # Nothing is flagged, so the write needs no confirmation and no terminal.
    it 'rewrites the label to its own href without stopping to ask' do
      run_task
      expect(mt.reload.translation).to include('>https://example.com/x</a>')
    end
  end

  # The label is rebuilt from the href, so a translated one is repaired rather than promoted. Before
  # that the href moved to the address the translator invented, with no visible text changing.
  context 'a comment body whose link label was translated' do
    let!(:comment) do
      store_raw(create(:comment), :body_multiloc, { 'en' =>
        'mail <a href="mailto:maintenance@raleighparks.gov" target="_blank" rel="noreferrer noopener nofollow">mantenimiento@raleighparks.gov</a>' })
    end

    it 'keeps the address the link points at' do
      run_task
      expect(comment.reload.body_multiloc['en']).to include 'href="mailto:maintenance@raleighparks.gov"'
      expect(comment.reload.body_multiloc['en']).not_to include 'mantenimiento'
    end

    it 'is not flagged as a moved link' do
      expect { run_task(dry_run: true) }.not_to output(/Links that now point elsewhere/).to_stdout
    end
  end

  # `linkify` reads an address out of the text around it, so a word touching the link was swallowed
  # into the address. The link is kept now rather than dissolved and rebuilt.
  context 'a comment body whose link touches the word before it' do
    let!(:comment) do
      store_raw(create(:comment), :body_multiloc, { 'en' =>
        '<p>de VRT<a href="mailto:jrose@vrt.org" target="_blank" rel="noreferrer noopener nofollow">jrose@vrt.org</a></p>' })
    end

    it 'keeps the address intact' do
      run_task
      expect(comment.reload.body_multiloc['en']).to include 'href="mailto:jrose@vrt.org"'
      expect(comment.reload.body_multiloc['en']).not_to include 'VRTjrose'
    end
  end

  # A title keeps no markup, so its link goes with the rest. The word check sees nothing, because
  # the label survives as text - which is why the destination is checked separately.
  context 'a title carrying a link' do
    let!(:idea) do
      store_raw(create(:idea), :title_multiloc, { 'en' => 'Read <a href="https://example.com/plan">the plan</a>' })
    end

    it 'lists the destination it would drop' do
      expect { run_task(dry_run: true) }.to output(
        %r{Links that now point elsewhere.*was: https://example.com/plan}m
      ).to_stdout
    end

    it 'strips it once confirmed' do
      answering 'y'
      run_task
      expect(idea.reload.title_multiloc['en']).to eq 'Read the plan'
    end
  end

  # Losing one is the point, so it is not a destination worth stopping for.
  context 'a title carrying a javascript: link' do
    let!(:idea) do
      store_raw(create(:idea), :title_multiloc, { 'en' => 'Read <a href="javascript:alert(1)">the plan</a>' })
    end

    it 'drops it without stopping to ask' do
      run_task
      expect(idea.reload.title_multiloc['en']).to eq 'Read the plan'
    end
  end

  context 'clean content' do
    let!(:idea) { create(:idea, body_multiloc: { 'en' => '<p>perfectly fine</p>' }) }

    it 'is left untouched and reported as no change' do
      expect { run_task }.not_to(change { idea.reload.body_multiloc })
      expect(report['changes']).to be_empty
      # Without this the example would also pass if the task had errored on every tenant.
      expect(report['errors']).to be_empty
      expect(report['processed_tenants']).to include(Tenant.current.host)
    end
  end

  context 'a dry run' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<img src=x onerror=alert(1)>' }) }

    it 'writes nothing but still reports the change it would make' do
      expect { run_task(dry_run: true) }.not_to(change { idea.reload.body_multiloc })
      expect(File).not_to exist(report_path)
      dry_run_report = JSON.parse(File.read(dry_run_report_path))
      expect(dry_run_report['changes']).not_to be_empty
    end
  end

  context 'when the task is run twice' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<img src=x onerror=alert(1)>' }) }

    it 'has nothing to do on the second run' do
      run_task
      Rake::Task['single_use:purge_stored_xss'].reenable

      expect { run_task }.not_to(change { idea.reload.body_multiloc })
      expect(report['changes']).to be_empty
    end
  end
end
# rubocop:enable RSpec/DescribeClass

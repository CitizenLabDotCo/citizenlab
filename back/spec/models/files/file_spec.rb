# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::File do
  subject(:file) { build(:file) }

  it { is_expected.to be_valid }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:content) }
    it { is_expected.to validate_numericality_of(:size).is_greater_than_or_equal_to(0).allow_nil }
    it { is_expected.to validate_inclusion_of(:category).in_array(described_class.categories.keys) }
    it { is_expected.to validate_presence_of(:category).with_message('is not included in the list') }
    it { is_expected.to validate_inclusion_of(:ai_processing_allowed).in_array([true, false]) }

    it 'is valid for all file extensions' do
      file = build(:file, name: 'filename.unknown_ext')
      expect(file).to be_valid
    end

    describe 'description_multiloc' do
      it 'accepts valid multiloc hash' do
        file.description_multiloc = { 'en' => 'English description', 'fr-FR' => 'Description française' }
        expect(file).to be_valid
      end

      it 'accepts empty multiloc hash' do
        file.description_multiloc = {}
        expect(file).to be_valid
      end

      it 'accepts nil' do
        file.description_multiloc = nil
        expect(file).to be_valid
      end

      it 'rejects invalid locale keys' do
        file.description_multiloc = { 'invalid-locale' => 'Some description' }
        expect(file).not_to be_valid
        expect(file.errors[:description_multiloc]).to be_present
      end
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:uploader).class_name('User').optional }
    it { is_expected.to have_many(:files_projects).class_name('Files::FilesProject').dependent(:destroy) }
    it { is_expected.to have_many(:projects).through(:files_projects) }
  end

  context 'tsvector' do
    let!(:test_file) do
      build(:file, name: 'test.pdf', description_multiloc: {
        'en' => 'Unit test for tsvector functionality',
        'fr-FR' => 'Test unitaire pour la fonctionnalité tsvector'
      })
    end

    it 'automatically generates tsvector column on save' do
      expect(test_file.tsvector).to be_nil

      test_file.save!

      expect(test_file.tsvector).to be_present
      expect(test_file.tsvector).to include("'test.pdf':1A")
      expect(test_file.tsvector).to include('fonctionnalité')
      expect(test_file.tsvector).to include('functionality')
    end

    it 'updates tsvector when description_multiloc changes' do
      test_file.save!
      expect do
        test_file.update!(description_multiloc: { 'en' => 'Updated content for testing' })
      end.to change { test_file.reload.tsvector }

      expect(test_file.tsvector).to include('updated')
      expect(test_file.tsvector).to include('content')
    end
  end

  describe 'metadata' do
    context 'when creating a new file' do
      it 'automatically calculates and stores both size and mime_type' do
        expect(file.size).to be_nil # Not calculated until save
        expect(file.mime_type).to be_nil

        file.save!

        expect(file.size).to be_present
        expect(file.size).to eq(130)
        expect(file.mime_type).to eq('application/pdf')
      end
    end

    context 'when updating the file content' do
      let!(:file) { create(:file) }

      it 'recalculates both size and mime_type' do
        file.content = Rails.root.join('spec/fixtures/audio_mp4.mp4').open

        expect { file.save! }
          .to change(file, :size).from(130).to(1_493)
          .and change(file, :mime_type).from('application/pdf').to('video/mp4')
      end
    end
  end

  describe 'search' do
    let_it_be(:project_report_pdf) { create(:file, name: 'project_report.pdf') }
    let_it_be(:annual_project_summary_pdf) { create(:file, name: 'annual project summary.pdf') }
    let_it_be(:project_report_caps_pdf) { create(:file, name: 'PROJECT_REPORT.PDF') }
    let_it_be(:projct_rport_pdf) { create(:file, name: 'projct_rport.pdf') }
    let_it_be(:budget_analysis_xlsx) { create(:file, name: 'budget_analysis.xlsx') }
    let_it_be(:notes123_pdf) { create(:file, name: 'notes123.pdf') }

    context 'searching by filename' do
      it 'finds files with exact name matches (case-insensitive)' do
        results = described_class.search('project_report.pdf')
        file1, file2 = top2 = results.take(2)

        expect(top2).to contain_exactly(project_report_pdf, project_report_caps_pdf)
        expect(file1.pg_search_rank).to eq(file2.pg_search_rank)
      end

      it 'finds files matching partial search terms' do
        # matching terms, but in different order
        results = described_class.search('summary annual')
        expect(results.first).to eq(annual_project_summary_pdf)
        expect(results).not_to include(budget_analysis_xlsx)
      end

      it 'finds files matching exact partial search terms (case-insensitive)' do
        expect(described_class.search('et_an')).to contain_exactly(budget_analysis_xlsx)
        expect(described_class.search('eT_An')).to contain_exactly(budget_analysis_xlsx)
        expect(described_class.search('123')).to contain_exactly(notes123_pdf)
        expect(described_class.search('3.p')).to contain_exactly(notes123_pdf)
      end

      it 'finds files despite minor spelling errors' do
        results = described_class.search('project report')
        expect(results).to include(projct_rport_pdf)
        expect(results).not_to include(budget_analysis_xlsx)
      end
    end

    context 'searching by description_multiloc' do
      let_it_be(:meeting_notes) do
        create(:file, name: 'meeting_notes.pdf', description_multiloc: {
          'en' => 'Important meeting about budget planning and resource allocation',
          'fr-FR' => 'Réunion importante sur la planification budgétaire'
        })
      end

      let_it_be(:strategic_plan) do
        create(:file, name: 'strategy.docx', description_multiloc: {
          'en' => 'Strategic planning document for 2024 initiatives',
          'nl-BE' => 'Strategisch planningsdocument voor 2024 initiatieven'
        })
      end

      let_it_be(:policy_doc) do
        create(:file, name: 'policy.pdf', description_multiloc: {
          'en' => 'New policy guidelines for remote work procedures'
        })
      end

      it 'handles querying in different languages' do
        results = described_class.search('réunion resource allocation')
        expect(results).to contain_exactly(meeting_notes)

        results = described_class.search('strategic planningsdocument')
        expect(results).to contain_exactly(strategic_plan)
      end

      it 'handles fuzzy matching in descriptions' do
        results = described_class.search('Strategich planningdocument ') # two spelling errors
        expect(results).to contain_exactly(strategic_plan)
      end

      it 'searches case-insensitively in descriptions' do
        results = described_class.search('BuDgEt PlANnInG')
        expect(results).to include(meeting_notes)
      end

      it 'handles partial word matches in descriptions' do
        # Works but needs more words to get a sufficient score
        results = described_class.search('mportan eetin bou udge lannin esourc llocatio lanificati')
        expect(results).to include(meeting_notes)
      end
    end

    context 'combined name and description search' do
      let_it_be(:comprehensive_file) do
        create(:file, name: 'comprehensive_report.pdf', description_multiloc: {
          'en' => 'Comprehensive analysis of project outcomes and budget impact'
        })
      end

      it 'finds files matching both name and description' do
        results = described_class.search('comprehensive_report.pdf outcome')
        expect(results).to include(comprehensive_file)
      end

      it 'prioritizes exact name matches over description matches' do
        name_match = create(:file, name: 'unique_budget_file.pdf', description_multiloc: { 'en' => 'Some other content' })
        desc_match = create(:file, name: 'other_file.pdf', description_multiloc: { 'en' => 'See unique_budget_file.pdf' })

        results = described_class.search('unique_budget_file.pdf')
        # using +eq+ because we want to check the order as well
        expect(results).to eq [name_match, desc_match]
      end
    end

    context 'edge cases' do
      it 'returns an empty result when searching with an empty string' do
        results = described_class.search('')
        expect(results).to be_empty
      end

      it 'returns an empty result when searching with only whitespace' do
        results = described_class.search('  ')
        expect(results).to be_empty
      end

      it 'returns an empty result when searching with nil' do
        results = described_class.search(nil)
        expect(results).to be_empty
      end

      it 'returns an empty result when no files match the search term' do
        results = described_class.search('nonexistent')
        expect(results).to be_empty
      end

      it 'handles special characters in search queries' do
        special_file = create(:file, name: 'file@domain.pdf', description_multiloc: { 'en' => 'Email: test@example.com' })

        results = described_class.search('@domain')
        expect(results).to include(special_file)

        results = described_class.search('test@example')
        expect(results).to include(special_file)
      end

      it 'handles numeric search terms' do
        numeric_file = create(:file, name: 'report.pdf', description_multiloc: { 'en' => 'Annual report for 2024' })

        results = described_class.search('2024')
        expect(results).to include(numeric_file)
      end
    end
  end

  describe 'destroy!' do
    # Destroying the last attachments the last attachment is also destroying the file.
    # This test ensures that the callback does not fail because it was triggered by the
    # file destroy callback.
    it 'does not cause a circular dependency error' do
      attachment = create(:file_attachment)
      file = attachment.file

      expect { file.destroy! }.not_to raise_error
    end
  end

  it 'category defaults to "other" when no category is specified' do
    file = build(:file)
    expect(file.category).to eq('other')
    expect(file).to be_valid
  end

  it 'provides predicate methods for categories' do
    file = create(:file, category: 'meeting')
    expect(file.meeting?).to be true
    expect(file.report?).to be false
  end
end

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
  end

  describe 'associations' do
    it { is_expected.to belong_to(:uploader).class_name('User').optional }
    it { is_expected.to have_many(:files_projects).class_name('Files::FilesProject').dependent(:destroy) }
    it { is_expected.to have_many(:projects).through(:files_projects) }
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

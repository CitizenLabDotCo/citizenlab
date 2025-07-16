# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::FileFinder do
  subject(:finder) { described_class.new(scope, **params) }

  let(:scope) { Files::File.all }
  let(:params) { {} }

  describe '#execute' do
    subject(:results) { finder.execute }

    before_all do
      @uploader1 = create(:user)
      @uploader2 = create(:user)

      @file_without_uploader = create(:file, uploader: nil)
      @uploader1_file = create(:file, uploader: @uploader1)
      @uploader2_files = create_pair(:file, uploader: @uploader2)

      @files = [
        @file_without_uploader,
        @uploader1_file,
        @uploader2_files
      ].flatten
    end

    context 'without any filters' do
      it 'returns all files' do
        expect(results).to match_array(@files)
      end
    end

    context 'with project filter' do
      let_it_be(:file_project) { create(:files_project) }
      let_it_be(:project) { file_project.project }
      let_it_be(:file) { file_project.file }

      context 'when project is a single project' do
        let(:params) { { project: project.id } }

        it 'returns only files associated with the project' do
          expect(results).to contain_exactly(file)
        end
      end

      context 'when project is nil' do
        let(:params) { { project: nil } }

        it 'returns files without a project' do
          expect(results).to match_array(@files)
          expect(results).not_to include(file)
        end
      end
    end

    context 'with uploader filter' do
      context 'when uploader is a single user' do
        let(:params) { { uploader: @uploader1 } }

        it 'returns files uploaded by that user' do
          expect(results.sole).to eq(@uploader1_file)
        end
      end

      context 'when uploader is multiple users' do
        let(:params) { { uploader: User.where(id: [@uploader1, @uploader2]) } }

        it 'returns files uploaded by any of those users' do
          expected_files = [@uploader1_file, @uploader2_files].flatten
          expect(results).to match_array(expected_files)
        end
      end

      context 'when uploader is nil' do
        let(:params) { { uploader: nil } }

        it 'returns files without an uploader' do
          expect(results.sole).to eq(@file_without_uploader)
        end
      end

      context 'when uploader is empty array' do
        let(:params) { { uploader: [] } }

        it { is_expected.to be_empty }
      end
    end

    context 'with category filter' do
      let_it_be(:meeting_file) { create(:file, :meeting) }
      let_it_be(:report_file) { create(:file, :report) }
      let_it_be(:policy_file) { create(:file, :policy) }

      context 'when category is a single category' do
        let(:params) { { category: 'meeting' } }

        it 'returns files with that category' do
          expect(results).to contain_exactly(meeting_file)
        end
      end

      context 'when category is multiple categories' do
        let(:params) { { category: %w[meeting report] } }

        it 'returns files with any of those categories' do
          expect(results).to contain_exactly(meeting_file, report_file)
        end
      end

      context 'when category is empty array' do
        let(:params) { { category: [] } }

        it { is_expected.to be_empty }
      end

      context 'when category does not exist' do
        let(:params) { { category: 'nonexistent' } }

        it { is_expected.to be_empty }
      end
    end
  end
end

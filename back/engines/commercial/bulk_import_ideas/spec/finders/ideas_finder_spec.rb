# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:result) { described_class.new(params, current_user: current_user) }

  let(:current_user) { create(:admin) }
  let(:result_record_ids) { result.find_records.pluck(:id) }
  let!(:online_ideas) { create_list(:idea, 2) }
  let!(:imported_idea) { create(:idea_import).idea }

  describe '#imported_condition' do
    context 'when true' do
      let(:params) { { imported: 'true' } }

      it 'returns the imported ideas' do
        expect(result_record_ids).to eq [imported_idea.id]
      end
    end

    context 'when false' do
      let(:params) { { imported: 'false' } }

      it 'returns the ideas that were not imported' do
        expect(result_record_ids).to match_array online_ideas.map(&:id)
      end
    end

    context 'when absent' do
      let(:params) { {} }

      it 'returns all ideas' do
        expect(result_record_ids).to match_array [*online_ideas, imported_idea].map(&:id)
      end
    end

    context 'when the user is a project moderator' do
      let(:current_user) { create(:project_moderator, projects: [imported_idea.project]) }
      let(:params) { { imported: 'false' } }

      it 'only returns ideas of the moderated projects' do
        create(:idea, project: imported_idea.project).tap do |online_idea|
          expect(result_record_ids).to eq [online_idea.id]
        end
      end
    end

    context 'when the user cannot moderate' do
      using RSpec::Parameterized::TableSyntax

      where(:user_factory, :imported) do
        :user | 'true'
        :user | 'false'
        nil   | 'true'
        nil   | 'false'
      end

      with_them do
        let(:current_user) { user_factory && create(user_factory) }
        let(:params) { { imported: imported } }

        it 'returns no ideas' do
          expect(result_record_ids).to be_empty
        end
      end
    end
  end
end

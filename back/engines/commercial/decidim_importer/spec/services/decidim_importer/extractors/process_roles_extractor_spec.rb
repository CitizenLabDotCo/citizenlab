# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ProcessRolesExtractor do
  subject(:extractor) do
    described_class.new(rows, ref_map, locale_mapper: DecidimImporter::LocaleMapper.new({}, fallback_locale: 'fr-FR'))
  end

  let(:ref_map) { DecidimImporter::RefMap.new }

  before do
    ref_map.register('decidim-user-8', DecidimImporter::Record.new('user', { 'email' => 'a@b.co' }))
    ref_map.register('decidim-process-1', DecidimImporter::Record.new('project', { 'slug' => 'bp2019' }))
  end

  def role_row(user:, role:, process: 'decidim-process-1')
    { 'uid' => user, 'role' => role, 'decidim_participatory_process' => process }
  end

  describe '#run' do
    let(:rows) { [role_row(user: 'decidim-user-8', role: 'admin')] }

    it 'emits a natural-key tuple (user unique_code + project slug) for a moderator role' do
      expect(extractor.run).to eq([{ 'user_unique_code' => 'decidim-user-8', 'project_slug' => 'bp2019' }])
    end

    context 'with a private-space participant' do
      let(:rows) { [role_row(user: 'decidim-user-8', role: 'private_user')] }

      it 'ignores private_user (not a staff role)' do
        expect(extractor.run).to be_empty
      end
    end

    context 'with staff roles other than admin' do
      let(:rows) do
        [role_row(user: 'decidim-user-8', role: 'collaborator'), role_row(user: 'decidim-user-8', role: 'MODERATOR')]
      end

      it 'maps every staff role (case-insensitively) to a moderator assignment' do
        expect(extractor.run.size).to eq(2)
      end
    end

    context 'when the user was not imported' do
      let(:rows) { [role_row(user: 'decidim-user-999', role: 'admin')] }

      it 'skips the role and records why' do
        expect(extractor.run).to be_empty
        expect(extractor.skipped.first[:reason]).to match(/user that was not imported/)
      end
    end

    context 'when the project has no slug (e.g. a de-duped Decidim slug)' do
      before { ref_map.register('decidim-process-2', DecidimImporter::Record.new('project', {})) }

      let(:rows) { [role_row(user: 'decidim-user-8', role: 'admin', process: 'decidim-process-2')] }

      it 'skips the role, since ModeratorAssigner matches projects by slug' do
        expect(extractor.run).to be_empty
        expect(extractor.skipped.first[:reason]).to match(/no slug/)
      end
    end
  end
end

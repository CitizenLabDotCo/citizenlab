# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::PrivateSpaceMembersExtractor do
  subject(:extractor) do
    described_class.new(rows, ref_map, locale_mapper: DecidimImporter::LocaleMapper.new({}, fallback_locale: 'fr-FR'))
  end

  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:project) do
    DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'Labo' }, 'visible_to' => 'admins' })
  end

  before do
    ref_map.register('user-1', DecidimImporter::Record.new('user', { 'email' => 'a@b.co' }))
    ref_map.register('user-2', DecidimImporter::Record.new('user', { 'email' => 'c@d.co' }))
    ref_map.register('space-1', project)
  end

  def role_row(user:, role: 'private_user', space: 'space-1')
    { 'uid' => user, 'role' => role, 'decidim_participatory_process' => space }
  end

  def records(model)
    ref_map.records.select { |r| r.model_name == model }
  end

  context 'with members of a private space' do
    let(:rows) { [role_row(user: 'user-1'), role_row(user: 'user-2'), role_row(user: 'user-2', role: 'admin')] }

    it 'makes the project visible to a manual group of its members only' do
      extractor.run

      group = records('group').sole
      expect(group.attributes['membership_type']).to eq('manual')
      expect(group.attributes['title_multiloc']['fr-FR']).to include('Labo')
      expect(records('membership').map { |m| m.attributes['user_ref'] })
        .to contain_exactly(ref_map.fetch('user-1').attributes, ref_map.fetch('user-2').attributes)
      expect(records('groups_project').sole.attributes)
        .to include('group_ref' => group.attributes, 'project_ref' => project.attributes)
      expect(project.attributes['visible_to']).to eq('groups')
      expect(extractor.adjusted).to contain_exactly(hash_including(uid: 'space-1'))
    end
  end

  context 'with two member accounts imported as one user (same email)' do
    let(:rows) { [role_row(user: 'user-1'), role_row(user: 'user-1-duplicate')] }

    before { ref_map.register_alias('user-1-duplicate', ref_map.fetch('user-1')) }

    it 'adds the user to the group once' do
      extractor.run

      expect(records('membership').sole.attributes['user_ref']).to be(ref_map.fetch('user-1').attributes)
    end
  end

  context 'when no member was imported' do
    let(:rows) { [role_row(user: 'user-9')] }

    it 'keeps the project admins-only and logs the missing member' do
      expect(extractor.run).to be_empty
      expect(records('group')).to be_empty
      expect(project.attributes['visible_to']).to eq('admins')
      expect(extractor.skipped).to contain_exactly(hash_including(uid: 'user-9'))
      expect(extractor.adjusted).to contain_exactly(hash_including(uid: 'space-1'))
    end
  end

  context 'when the space is not private' do
    let(:rows) { [role_row(user: 'user-1')] }

    before { project.attributes.delete('visible_to') }

    it 'leaves it public with no group' do
      expect(extractor.run).to be_empty
      expect(records('group')).to be_empty
      expect(project.attributes).not_to have_key('visible_to')
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::ModeratorAssigner do
  subject(:assigner) { described_class.new }

  let!(:user) { create(:user, unique_code: 'decidim-user-8') }
  let!(:project) { create(:project, slug: 'bp2019') }

  def assignment(unique_code: 'decidim-user-8', slug: 'bp2019')
    { 'user_unique_code' => unique_code, 'project_slug' => slug }
  end

  it 'grants project_moderator, matching the user by unique_code and the project by slug' do
    expect(assigner.assign([assignment])).to eq(1)
    expect(user.reload.project_moderator?(project.id)).to be(true)
  end

  it 'is idempotent — a role already held is neither re-added nor counted' do
    assigner.assign([assignment])
    expect(assigner.assign([assignment])).to eq(0)
    expect(user.reload.roles.count { |r| r['type'] == 'project_moderator' && r['project_id'] == project.id }).to eq(1)
  end

  it 'skips (without raising) a user missing from the tenant' do
    expect(assigner.assign([assignment(unique_code: 'decidim-user-absent')])).to eq(0)
  end

  it 'skips (without raising) a project whose slug is missing from the tenant' do
    expect(assigner.assign([assignment(slug: 'no-such-project')])).to eq(0)
    expect(user.reload.project_moderator?).to be(false)
  end

  it 'returns 0 for an empty list' do
    expect(assigner.assign([])).to eq(0)
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::RowScoper do
  let(:rows) do
    {
      organization: [{ 'uid' => 'org-1' }],
      scopes: [{ 'uid' => 'scope-1' }],
      users: [{ 'uid' => 'user-1' }, { 'uid' => 'user-2' }, { 'uid' => 'user-3' }, { 'uid' => 'user-unref' }],
      folders: [{ 'uid' => 'group-A' }, { 'uid' => 'group-B' }],
      projects: [
        { 'uid' => 'proc-1', 'participatory_process_group' => 'group-A' },
        { 'uid' => 'proc-2', 'participatory_process_group' => 'group-B' }
      ],
      components: [
        { 'uid' => 'comp-1', 'decidim_participatory_process' => 'proc-1' },
        { 'uid' => 'comp-2', 'decidim_participatory_process' => 'proc-2' }
      ],
      proposals: [
        { 'uid' => 'prop-1', 'decidim_participatory_process' => 'proc-1', 'authors' => '["user-1","user-2"]' },
        { 'uid' => 'prop-2', 'decidim_participatory_process' => 'proc-2', 'authors' => '["user-3"]' }
      ],
      comments: [{ 'uid' => 'c-1', 'decidim_participatory_process' => 'proc-1', 'author' => 'user-3' }],
      followers: [{ 'uid' => 'f-1', 'decidim_participatory_process' => 'proc-1', 'user' => 'user-2' }]
    }
  end

  it 'keeps only the selected container’s rows, its referenced users, and its folder' do
    scoped = described_class.scope(rows, ['proc-1'])

    expect(scoped[:projects].pluck('uid')).to eq(['proc-1'])
    expect(scoped[:components].pluck('uid')).to eq(['comp-1'])
    expect(scoped[:proposals].pluck('uid')).to eq(['prop-1'])
    expect(scoped[:comments].pluck('uid')).to eq(['c-1'])
    # users referenced by proc-1: proposal authors user-1/user-2, comment author user-3, follower user-2
    expect(scoped[:users].pluck('uid')).to contain_exactly('user-1', 'user-2', 'user-3')
    expect(scoped[:folders].pluck('uid')).to eq(['group-A'])
    # scopes (→ areas) are dropped — the tenant already holds them
    expect(scoped).not_to have_key(:scopes)
    # the organization row is kept — it drives the app-config locale patch + user custom fields
    expect(scoped[:organization]).to eq([{ 'uid' => 'org-1' }])
  end

  it 'unions referenced users/folders across multiple containers' do
    scoped = described_class.scope(rows, %w[proc-1 proc-2])

    expect(scoped[:projects].pluck('uid')).to contain_exactly('proc-1', 'proc-2')
    expect(scoped[:users].pluck('uid')).to contain_exactly('user-1', 'user-2', 'user-3')
    expect(scoped[:folders].pluck('uid')).to contain_exactly('group-A', 'group-B')
  end

  it 'omits the users/folders streams when nothing references them' do
    minimal = {
      projects: [{ 'uid' => 'proc-1', 'participatory_process_group' => '' }], # ungrouped → no folder
      users: [{ 'uid' => 'user-1' }],
      folders: [{ 'uid' => 'group-A' }]
    }
    scoped = described_class.scope(minimal, ['proc-1'])

    expect(scoped[:projects].pluck('uid')).to eq(['proc-1'])
    expect(scoped).not_to have_key(:users)
    expect(scoped).not_to have_key(:folders)
  end

  it 'raises when no container uid is given' do
    expect { described_class.scope(rows, []) }.to raise_error(ArgumentError)
    expect { described_class.scope(rows, ['  ']) }.to raise_error(ArgumentError)
  end
end

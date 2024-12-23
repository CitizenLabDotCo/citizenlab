# frozen_string_literal: true

require 'rails_helper'
require Rails.root.join('db/migrate/20241127093339_add_first_published_at_to_admin_publications')

RSpec.describe AddFirstPublishedAtToAdminPublications do
  subject(:migration) { described_class.new }

  before { migration.migrate(:down) }

  it 'adds first_published_at column to admin_publications' do
    expect { migration.change }
      .to change { ActiveRecord::Base.connection.column_exists?(:projects, :first_published_at) }
      .from(false).to(true)
  end

  it 'populates first_published_at correctly' do
    published_project_ap1, published_project_ap2 = create_list(:admin_publication, 2)
    published_folder_ap = create(:admin_publication, :folder)

    draft_project_ap = create(:admin_publication, publication_status: 'draft')
    archived_project_ap = create(:admin_publication, publication_status: 'archived')
    draft_folder_ap = create(:admin_publication, :folder, publication_status: 'draft')

    # Reloading to get the correct timestamps (DB truncates to milliseconds)
    pub_activity1 = create(:activity, item: published_project_ap2.publication, action: 'published', acted_at: 1.day.ago).reload
    pub_activity2 = create(:activity, item: draft_project_ap.publication, action: 'published', acted_at: 2.days.ago).reload

    migration.change

    expect(published_project_ap1.reload.first_published_at).to eq(published_project_ap1.created_at)
    expect(published_project_ap2.reload.first_published_at).to eq(pub_activity1.acted_at)
    expect(published_folder_ap.reload.first_published_at).to eq(published_folder_ap.created_at)
    expect(draft_project_ap.reload.first_published_at).to eq(pub_activity2.acted_at)

    expect(archived_project_ap.reload.first_published_at).to be_nil
    expect(draft_folder_ap.reload.first_published_at).to be_nil
  end
end

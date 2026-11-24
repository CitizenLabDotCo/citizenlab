# frozen_string_literal: true

require 'rails_helper'

# Separate connections must see committed records to exercise the lock.
RSpec.describe LocalProjectCopyService, use_transactional_fixtures: false do
  it 'gives each concurrent copy of a project its own slug' do
    project = create(:project, title_multiloc: { en: 'Copy me' }, slug: 'copy-me')

    copies = concurrently(2) { described_class.new.copy(Project.find(project.id)) }

    expect(copies.map(&:slug)).to contain_exactly('copy-me-copy', 'copy-me-copy-1')
  end

  it 'gives concurrent copies of projects with the same title their own slug' do
    project_ids = create_list(:project, 2, title_multiloc: { en: 'Same title' }).map(&:id)

    copies = concurrently(2) { |index| described_class.new.copy(Project.find(project_ids[index])) }

    expect(copies.map(&:slug)).to contain_exactly('same-title-copy', 'same-title-copy-1')
  end
end

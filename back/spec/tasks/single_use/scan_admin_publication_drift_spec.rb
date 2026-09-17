# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
RSpec.describe 'single_use:scan_admin_publication_drift rake task' do
  before(:all) { load_rake_tasks_if_not_loaded } # rubocop:disable RSpec/BeforeAfterAll

  after { Rake::Task['single_use:scan_admin_publication_drift'].reenable }

  def run_task
    Rake::Task['single_use:scan_admin_publication_drift'].invoke
  end

  it 'prints the id, created_at and updated_at of orphaned publications' do
    project = create(:project)
    project.admin_publication.delete # raw delete -> orphans the project (no callbacks)

    expect { run_task }.to output(
      /orphaned Project #{project.id} created_at=.+ updated_at=.+/
    ).to_stdout
  end

  it 'reports nothing for a healthy tenant' do
    create(:project)
    expect { run_task }.to output(/Flagged 0 tenant/).to_stdout
  end
end
# rubocop:enable RSpec/DescribeClass

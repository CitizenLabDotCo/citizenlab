require 'rails_helper'

describe 'analytics:delete_initiative_dimension_types rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['analytics:delete_initiative_dimension_types'].reenable }

  it 'deletes dimension types referring to initiatives' do
    create(:dimension_type, name: 'initiative')
    create(:dimension_type, parent: 'initiative')
    create(:dimension_type, name: 'comment', parent: 'idea')

    Rake::Task['analytics:delete_initiative_dimension_types'].invoke

    expect(Analytics::DimensionType.count).to eq 1
    expect(Analytics::DimensionType.first.name).to eq 'comment'
    expect(Analytics::DimensionType.first.parent).to eq 'idea'
  end
end
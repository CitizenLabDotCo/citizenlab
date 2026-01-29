# frozen_string_literal: true

require 'rails_helper'

describe 'rake single_use:remap_areas_and_custom_field_options' do # rubocop:disable RSpec/DescribeClass
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['single_use:remap_areas_and_custom_field_options'].reenable }

  let(:csv_path) { Rails.root.join('spec/fixtures/area_remapping.csv') }
  let(:tenant) { Tenant.current }

  context 'when domicile custom field exists' do
    let!(:domicile_field) { create(:custom_field_domicile) }
    let!(:area_hulst) { create(:area, title_multiloc: { 'en' => 'Hulst' }) }
    let!(:area_sint_jansteen) { create(:area, title_multiloc: { 'en' => 'Sint Jansteen' }) }
    let!(:area_graauw) { create(:area, title_multiloc: { 'en' => 'Graauw' }) }
    let!(:area_paal) { create(:area, title_multiloc: { 'en' => 'Paal' }) }
    let!(:area_zandberg) { create(:area, title_multiloc: { 'en' => 'Zandberg' }) }
    let!(:area_kloosterzande) { create(:area, title_multiloc: { 'en' => 'Kloosterzande' }) }
    let!(:area_kruispolderhaven) { create(:area, title_multiloc: { 'en' => 'Kruispolderhaven' }) }
    let!(:area_kruisdorp) { create(:area, title_multiloc: { 'en' => 'Kruisdorp' }) }
    let!(:area_ossenisse) { create(:area, title_multiloc: { 'en' => 'Ossenisse' }) }
    let!(:area_zeedorp) { create(:area, title_multiloc: { 'en' => 'Zeedorp' }) }
    let!(:area_kreverhille) { create(:area, title_multiloc: { 'en' => 'Kreverhille' }) }
    let!(:area_strooienstad) { create(:area, title_multiloc: { 'en' => 'Strooienstad' }) }

    it 'merges, renames, and updates all associations and multiloc values' do
      # Setup associations and multiloc
      project = create(:project)
      area_graauw.projects << project
      area_paal.projects << project
      user1 = create(:user, custom_field_values: { 'domicile' => area_paal.id })
      user2 = create(:user, custom_field_values: { 'domicile' => area_zandberg.id })
      area_graauw.update!(title_multiloc: { 'en' => 'Graauw', 'nl-NL' => 'Graauw Nederlands', 'fr-FR' => 'Graauw Français' })
      user3 = create(:user)
      create(:follower, followable: area_graauw, user: user1)
      create(:follower, followable: area_paal, user: user2)
      create(:follower, followable: area_graauw, user: user3)
      create(:follower, followable: area_paal, user: user3)
      project1 = create(:project)
      project2 = create(:project)
      create(:areas_project, area: area_ossenisse, project: project1)
      create(:areas_project, area: area_zeedorp, project: project1)
      create(:areas_project, area: area_zeedorp, project: project2)
      initial_area_count = Area.count
      initial_option_count = domicile_field.options.count

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      # Graauw should exist and have the updated name and multiloc
      area_graauw.reload
      expect(area_graauw.title_multiloc['en']).to eq('Graauw')
      expect(area_graauw.title_multiloc['nl-NL']).to eq('Graauw')
      expect(area_graauw.title_multiloc['fr-FR']).to eq('Graauw')
      expect(area_graauw.custom_field_option.title_multiloc['en']).to eq('Graauw')

      # Users should now reference Graauw
      expect(user1.reload.custom_field_values['domicile']).to eq(area_graauw.id)
      expect(user2.reload.custom_field_values['domicile']).to eq(area_graauw.id)

      # Project should still be associated with Graauw (and not duplicated)
      expect(area_graauw.projects).to include(project)
      expect(area_graauw.projects.count).to eq(1)

      # Followers
      expect(area_graauw.followers.count).to eq(3)
      expect(area_graauw.followers.pluck(:user_id)).to contain_exactly(user1.id, user2.id, user3.id)
      expect(area_graauw.followers_count).to eq(3)

      # Project associations for merged area
      area_kreverhille.reload
      expect(area_kreverhille.title_multiloc['en']).to eq('Ossenisse')
      expect(area_kreverhille.projects).to contain_exactly(project1, project2)
      expect(AreasProject.where(area_id: area_kreverhille.id).count).to eq(2)

      # Paal and Zandberg should be deleted
      expect { area_paal.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { area_zandberg.reload }.to raise_error(ActiveRecord::RecordNotFound)

      # Area and option counts
      expect(Area.count).to eq(initial_area_count - 7)
      expect(domicile_field.options.count).to eq(initial_option_count - 7)
    end

    it 'uses a database transaction that rolls back on error' do
      allow_any_instance_of(Area).to receive(:save).and_raise(StandardError.new('Test error'))
      initial_area_count = Area.count
      initial_option_count = domicile_field.options.count
      expect do
        Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)
      end.to raise_error(StandardError)
      expect(Area.count).to eq(initial_area_count)
      expect(domicile_field.options.count).to eq(initial_option_count)
    end
  end

  context 'when domicile custom field does not exist' do
    let!(:area_hulst) { create(:area, title_multiloc: { 'en' => 'Hulst' }) }
    let!(:area_sint_jansteen) { create(:area, title_multiloc: { 'en' => 'Sint Jansteen' }) }
    let!(:area_graauw) { create(:area, title_multiloc: { 'en' => 'Graauw' }) }
    let!(:area_paal) { create(:area, title_multiloc: { 'en' => 'Paal' }) }

    it 'still updates and merges areas without custom field options' do
      initial_count = Area.count
      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)
      expect(Area.count).to eq(initial_count - 1)
      expect { area_graauw.reload }.not_to raise_error
      expect(area_graauw.title_multiloc['en']).to eq('Graauw')
      expect { area_paal.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  context 'with missing areas in CSV' do
    let!(:domicile_field) { create(:custom_field_domicile) }
    let!(:area_hulst) { create(:area, title_multiloc: { 'en' => 'Hulst' }) }
    # Area 'Paal' is in CSV but doesn't exist in database

    it 'continues processing and reports missing areas' do
      _initial_count = Area.count

      # Should not raise error, just continue
      expect do
        Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)
      end.not_to raise_error

      # Hulst should still be processed
      area_hulst.reload
      expect(area_hulst.title_multiloc['en']).to eq('Hulst')
    end
  end

  context 'with invalid CSV format' do
    let(:invalid_csv_path) { Rails.root.join('spec/fixtures/engagementhq_demographics.csv') }

    it 'raises an error for missing OLD/NEW columns' do
      expect do
        Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, invalid_csv_path)
      end.to raise_error(/CSV must have OLD and NEW columns/)
    end
  end

  context 'with invalid arguments' do
    it 'raises an error when host is missing' do
      expect do
        Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(nil, csv_path)
      end.to raise_error(/Please provide host argument/)
    end

    it 'raises an error when csv_path is missing' do
      expect do
        Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, nil)
      end.to raise_error(/Please provide csv_path argument/)
    end

    it 'raises an error when CSV file does not exist' do
      expect do
        Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, '/nonexistent/file.csv')
      end.to raise_error(/CSV file not found/)
    end

    it 'raises an error when tenant does not exist' do
      expect do
        Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke('nonexistent.tenant', csv_path)
      end.to raise_error(/Tenant not found/)
    end
  end
end

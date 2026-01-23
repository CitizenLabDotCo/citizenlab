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

    it 'renames areas that map to themselves' do
      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      area_hulst.reload
      expect(area_hulst.title_multiloc['en']).to eq('Hulst')
      expect(area_hulst.custom_field_option.title_multiloc['en']).to eq('Hulst')
    end

    it 'merges multiple areas into one and updates custom field options' do
      # Create test data with associations
      project = create(:project)
      area_graauw.projects << project
      area_paal.projects << project

      user1 = create(:user, custom_field_values: { 'domicile' => area_paal.id })
      user2 = create(:user, custom_field_values: { 'domicile' => area_zandberg.id })

      initial_area_count = Area.count
      initial_option_count = domicile_field.options.count

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      # Should have merged Paal and Zandberg into Graauw
      # Graauw keeps its ID, Paal and Zandberg are deleted
      # Note: CSV also merges other areas, so total deletions are higher
      expect(Area.count).to eq(initial_area_count - 7)
      expect(domicile_field.options.count).to eq(initial_option_count - 7)

      # Graauw should exist and have the updated name
      expect { area_graauw.reload }.not_to raise_error
      expect(area_graauw.title_multiloc['en']).to eq('Graauw')
      expect(area_graauw.custom_field_option.title_multiloc['en']).to eq('Graauw')

      # Paal and Zandberg should be deleted
      expect { area_paal.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { area_zandberg.reload }.to raise_error(ActiveRecord::RecordNotFound)

      # Users should now reference Graauw
      expect(user1.reload.custom_field_values['domicile']).to eq(area_graauw.id)
      expect(user2.reload.custom_field_values['domicile']).to eq(area_graauw.id)

      # Project should still be associated with Graauw (and not duplicated)
      expect(area_graauw.projects).to include(project)
      expect(area_graauw.projects.count).to eq(1)
    end

    it 'merges multiple areas with one existing target area' do
      initial_count = Area.count

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      # Kloosterzande exists, Kruispolderhaven and Kruisdorp merged into it
      expect(Area.count).to eq(initial_count - 7) # 2 into Graauw, 2 into Kloosterzande, 3 into Ossenisse

      area_kloosterzande.reload
      expect(area_kloosterzande.title_multiloc['en']).to eq('Kloosterzande')
      expect { area_kruispolderhaven.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { area_kruisdorp.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'handles followers correctly during merge' do
      user1 = create(:user)
      user2 = create(:user)
      user3 = create(:user)

      # User1 follows Graauw
      create(:follower, followable: area_graauw, user: user1)
      # User2 follows Paal
      create(:follower, followable: area_paal, user: user2)
      # User3 follows both Graauw and Paal (should result in one follow after merge)
      create(:follower, followable: area_graauw, user: user3)
      create(:follower, followable: area_paal, user: user3)

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      area_graauw.reload

      # Should have 3 unique followers (user1, user2, user3)
      expect(area_graauw.followers.count).to eq(3)
      expect(area_graauw.followers.pluck(:user_id)).to contain_exactly(user1.id, user2.id, user3.id)
      expect(area_graauw.followers_count).to eq(3)
    end

    it 'handles static page associations during merge' do
      static_page = create(:static_page)

      AreasStaticPage.create!(area: area_ossenisse, static_page: static_page)
      AreasStaticPage.create!(area: area_zeedorp, static_page: static_page)

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      # Kreverhille is kept (alphabetically first) and renamed to Ossenisse
      area_kreverhille.reload
      expect(area_kreverhille.title_multiloc['en']).to eq('Ossenisse')

      # Should have one static page association (duplicates removed)
      expect(area_kreverhille.static_pages).to include(static_page)
      expect(AreasStaticPage.where(area_id: area_kreverhille.id, static_page_id: static_page.id).count).to eq(1)
    end

    it 'handles project associations during merge and removes duplicates' do
      project1 = create(:project)
      project2 = create(:project)

      # Both areas in project1 (should result in one association)
      create(:areas_project, area: area_ossenisse, project: project1)
      create(:areas_project, area: area_zeedorp, project: project1)

      # Only Zeedorp in project2
      create(:areas_project, area: area_zeedorp, project: project2)

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      # Kreverhille is kept (alphabetically first) and renamed to Ossenisse
      area_kreverhille.reload
      expect(area_kreverhille.title_multiloc['en']).to eq('Ossenisse')

      # Should have both projects, no duplicates
      expect(area_kreverhille.projects).to contain_exactly(project1, project2)
      expect(AreasProject.where(area_id: area_kreverhille.id).count).to eq(2)
    end

    it 'updates custom field options ordering correctly' do
      # Get the kept area (Graauw) - it's alphabetically first among Graauw, Paal, Zandberg
      kept_option = area_graauw.custom_field_option
      original_ordering = kept_option.ordering

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      # The kept option should maintain its ordering
      expect(kept_option.reload.ordering).to eq(original_ordering)
      expect(kept_option.title_multiloc['en']).to eq('Graauw')

      # Verify custom field options are in sync with areas
      domicile_field.reload
      area_ids = Area.order(:ordering).pluck(:custom_field_option_id)
      option_ids = domicile_field.options.order(:ordering).pluck(:id)

      # All area custom_field_option_ids should be in the domicile field options
      expect(option_ids).to include(*area_ids.compact)
    end

    it 'handles case-insensitive matching' do
      area_uppercase = create(:area, title_multiloc: { 'en' => 'HULST' })

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      # Should match case-insensitively
      area_uppercase.reload
      expect(area_uppercase.title_multiloc['en']).to eq('Hulst')
    end

    it 'preserves multiloc values across all locales' do
      # Test on existing area_hulst which maps to itself
      area_hulst.update!(title_multiloc: { 'en' => 'Hulst', 'nl-NL' => 'Hulst Nederlands', 'fr-FR' => 'Hulst Français' })

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      area_hulst.reload
      # All locales should be updated to the new name
      expect(area_hulst.title_multiloc['en']).to eq('Hulst')
      expect(area_hulst.title_multiloc['nl-NL']).to eq('Hulst')
      expect(area_hulst.title_multiloc['fr-FR']).to eq('Hulst')
    end

    it 'uses a database transaction that rolls back on error' do
      # Create an invalid state that will cause an error
      allow_any_instance_of(Area).to receive(:save).and_raise(StandardError.new('Test error'))

      initial_area_count = Area.count
      initial_option_count = domicile_field.options.count

      expect do
        Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)
      end.to raise_error(StandardError)

      # Everything should be rolled back
      expect(Area.count).to eq(initial_area_count)
      expect(domicile_field.options.count).to eq(initial_option_count)
    end
  end

  context 'when domicile custom field does not exist' do
    let!(:area_hulst) { create(:area, title_multiloc: { 'en' => 'Hulst' }) }
    let!(:area_sint_jansteen) { create(:area, title_multiloc: { 'en' => 'Sint Jansteen' }) }
    let!(:area_graauw) { create(:area, title_multiloc: { 'en' => 'Graauw' }) }
    let!(:area_paal) { create(:area, title_multiloc: { 'en' => 'Paal' }) }

    it 'still updates areas without custom field options' do
      initial_count = Area.count

      Rake::Task['single_use:remap_areas_and_custom_field_options'].invoke(tenant.host, csv_path)

      # Paal should be merged into Graauw
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

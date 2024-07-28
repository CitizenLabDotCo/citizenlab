require 'rails_helper'

describe CustomMaps::GeojsonExport::GeojsonGenerator do
  subject(:service) { described_class.new phase, custom_field1 }

  let(:project) { create(:single_phase_native_survey_project) }
  let(:phase) { project.phases.first }
  let(:form) { create(:custom_form, participation_context: phase) }
  let(:custom_field1) do
    create(:custom_field_point, resource: form, title_multiloc: { 'en' => 'Point field for focus of export' })
  end
  let(:custom_field2) do
    create(:custom_field_text, resource: form, title_multiloc: { 'en' => 'Field for text question' })
  end
  let(:custom_field3) do
    create(:custom_field_text, resource_type: 'User', title_multiloc: { 'en' => 'Field for registration question' })
  end

  let(:user) { create(:user, custom_field_values: { custom_field3.key => 'Registration q answer' }) }

  describe '#generate_geojson' do
    let(:idea1) do
      create(
        :idea,
        author: user,
        creation_phase: phase,
        project: project,
        custom_field_values: {
          custom_field1.key => { type: 'Point', coordinates: [1.1, 2.2] },
          custom_field2.key => 'Text answer 1'
        }
      )
    end
    let!(:idea_phase1) { create(:ideas_phase, idea: idea1, phase: phase) }

    let(:idea2) do
      create(
        :idea,
        creation_phase: phase,
        project: project,
        custom_field_values: {
          custom_field1.key => { type: 'Point', coordinates: [3.3, 4.4] },
          custom_field2.key => 'Text answer 2'
        }
      )
    end
    let!(:idea_phase2) { create(:ideas_phase, idea: idea2, phase: phase) }

    let(:parsed_json) { JSON.parse(service.generate_geojson) }

    it 'generates a GeoJSON feature collection' do
      expect(parsed_json.keys).to eq %w[type features]
      expect(parsed_json['type']).to eq('FeatureCollection')
    end

    it 'generates a GeoJSON Feature for each input' do
      expect(parsed_json['features'].size).to eq 2
      expect(parsed_json['features'].pluck('type')).to all(eq('Feature'))
    end

    it 'includes geometry of each response to the question custom_field in focus, in each respective GeoJSON Feature' do
      expect(parsed_json['features'].pluck('geometry')).to match_array([
        { 'type' => 'Point', 'coordinates' => [1.1, 2.2] },
        { 'type' => 'Point', 'coordinates' => [3.3, 4.4] }
      ])
    end

    it "includes survey responses & selected user data for each input, in each related GeoJSON Feature's properties" do
      expect(parsed_json['features'].pluck('properties')).to match_array([
        {
          'Point field for focus of export [Longitude, Latitude]' => { 'type' => 'Point', 'coordinates' => [1.1, 2.2] },
          'Field for text question' => 'Text answer 1',
          'user_data' => {
            'Author ID' => idea1.author.id,
            'Author email' => idea1.author.email,
            'Author name' => idea1.author_name,
            'Field for registration question' => 'Registration q answer'
          }
        },
        {
          'Point field for focus of export [Longitude, Latitude]' => { 'type' => 'Point', 'coordinates' => [3.3, 4.4] },
          'Field for text question' => 'Text answer 2',
          'user_data' => {
            'Author ID' => idea2.author.id,
            'Author email' => idea2.author.email,
            'Author name' => idea2.author_name,
            'Field for registration question' => nil
          }
        }
      ])
    end
  end

  describe '#set_non_colliding_titles' do
    let!(:custom_field2) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:custom_field3) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:custom_field4) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:custom_field5) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 2' }) }

    it 'adds suffixes to avoid collisions' do
      expect(service.send(:set_non_colliding_titles)).to match({
        custom_field1.id => 'Point field for focus of export [Longitude, Latitude]',
        custom_field2.id => 'Title 1 (1)',
        custom_field3.id => 'Title 1 (2)',
        custom_field4.id => 'Title 1 (3)',
        custom_field5.id => 'Title 2'
      })
    end
  end
end

require 'rails_helper'

describe Export::Geojson::GeojsonGenerator do
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
      expect(parsed_json['features'].pluck('geometry')).to contain_exactly({ 'type' => 'Point', 'coordinates' => [1.1, 2.2] }, { 'type' => 'Point', 'coordinates' => [3.3, 4.4] })
    end

    it "includes survey responses & selected user data for each input, in each related GeoJSON Feature's properties" do
      expect(parsed_json['features'].pluck('properties')).to contain_exactly({
        'id' => idea1.id,
        'published_at' => idea1.published_at.strftime('%m/%d/%Y %H:%M:%S').to_s,
        'point_field_for_focus_of_export' => { 'type' => 'Point', 'coordinates' => [1.1, 2.2] },
        'field_for_text_question' => 'Text answer 1',
        'user_data__author_id' => idea1.author.id,
        'user_data__author_email' => idea1.author.email,
        'user_data__author_name' => idea1.author_name,
        'user_data__field_for_registration_question' => 'Registration q answer'
      }, {
        'id' => idea2.id,
        'published_at' => idea2.published_at.strftime('%m/%d/%Y %H:%M:%S').to_s,
        'point_field_for_focus_of_export' => { 'type' => 'Point', 'coordinates' => [3.3, 4.4] },
        'field_for_text_question' => 'Text answer 2',
        'user_data__author_id' => idea2.author.id,
        'user_data__author_email' => idea2.author.email,
        'user_data__author_name' => idea2.author_name,
        'user_data__field_for_registration_question' => nil
      })
    end
  end

  describe '#set_non_colliding_titles' do
    let!(:custom_field2) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:custom_field3) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:custom_field4) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:custom_field5) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 2' }) }

    it 'adds suffixes to avoid collisions' do
      expect(service.send(:set_non_colliding_titles)).to match({
        custom_field1.id => 'point_field_for_focus_of_export',
        custom_field2.id => 'title_1_1',
        custom_field3.id => 'title_1_2',
        custom_field4.id => 'title_1_3',
        custom_field5.id => 'title_2'
      })
    end
  end

  describe 'sanitize_key' do
    it 'removes non-alphanumeric characters, replacing hyphens and spaces with underscores' do
      expect(service.send(:sanitize_key, 'Test-key: With hyphen, commas, and question mark?'))
        .to eq 'test_key_with_hyphen_commas_and_question_mark'
    end
  end
end

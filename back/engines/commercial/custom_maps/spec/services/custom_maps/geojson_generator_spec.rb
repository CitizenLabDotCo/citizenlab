require 'rails_helper'

describe CustomMaps::GeojsonGenerator do
  subject(:service) { described_class.new phase, field }

  let(:phase) { create(:native_survey_phase) }
  let(:form) { create(:custom_form, participation_context: phase) }
  let(:field) { create(:custom_field_point, resource: form, title_multiloc: { 'en' => 'Field for focus of export' }) }

  describe '#set_non_colliding_titles' do
    let!(:field2) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:field3) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:field4) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 1' }) }
    let!(:field5) { create(:custom_field, resource: form, title_multiloc: { 'en' => 'Title 2' }) }

    it 'adds suffixes to avoid collisions' do
      expect(service.send(:set_non_colliding_titles)).to match({
        field.id => 'Field for focus of export [Longitude, Latitude]',
        field2.id => 'Title 1 (1)',
        field3.id => 'Title 1 (2)',
        field4.id => 'Title 1 (3)',
        field5.id => 'Title 2'
      })
    end
  end
end

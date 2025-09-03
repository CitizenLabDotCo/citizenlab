# frozen_string_literal: true

require 'rails_helper'

describe Analysis::PhaseToText do
  let(:service) { described_class.new }

  describe '#execute' do
    let(:project) { build(:project, title_multiloc: { en: 'Renewing the park' }, description_multiloc: { en: 'Help us make the park great again!' }) }
    let(:phase) do
      build(
        :phase,
        project: project,
        title_multiloc: { en: 'Collecting ideas' },
        description_multiloc: { en: 'Submit all your awesome ideas here!' }
      )
    end
    let(:craftjs_json) do
      {
        'ROOT' => {
          'type' => 'div',
          'nodes' => ['-02FjXHWIf'],
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'custom' => {},
          'hidden' => false,
          'isCanvas' => true,
          'displayName' => 'div',
          'linkedNodes' => {}
        },
        '-02FjXHWIf' => {
          'type' => {
            'resolvedName' => 'TextMultiloc'
          },
          'nodes' => [],
          'props' => {
            'text' => {
              'en' => '<p>This is the new description</p>'
            }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
              'defaultMessage' => 'Text'
            }
          },
          'hidden' => false,
          'parent' => 'ROOT',
          'isCanvas' => false,
          'displayName' => 'TextMultiloc',
          'linkedNodes' => {}
        }
      }
    end

    it 'includes phase and project attributes' do
      expect(service.execute(phase)).to eq({
        'Project title' => 'Renewing the park',
        'Project description' => 'Help us make the park great again!',
        'Phase title' => 'Collecting ideas',
        'Phase description' => 'Submit all your awesome ideas here!'
      })
    end

    context 'when the project has a content builder layout for the description' do
      it 'uses the layout to render the project description' do
        create(:layout, craftjs_json:, content_buildable: project, code: 'project_description', enabled: true)
        expect(service.execute(phase)).to eq({
          'Project title' => 'Renewing the park',
          'Project description' => 'This is the new description',
          'Phase title' => 'Collecting ideas',
          'Phase description' => 'Submit all your awesome ideas here!'
        })
      end
    end
  end
end

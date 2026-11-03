# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutService do
  let(:service) { described_class.new }

  def node(resolved_name, parent:, props: {}, nodes: [], linked_nodes: {}, is_canvas: false)
    {
      'type' => { 'resolvedName' => resolved_name },
      'parent' => parent,
      'props' => props,
      'nodes' => nodes,
      'linkedNodes' => linked_nodes,
      'isCanvas' => is_canvas,
      'custom' => {},
      'hidden' => false,
      'displayName' => resolved_name
    }
  end

  def spotlight(parent, publication)
    node('Spotlight', parent: parent, props: {
      'publicationId' => publication.id,
      'publicationType' => 'project',
      'buttonTextMultiloc' => { 'en' => 'Go' }
    })
  end

  describe 'select_craftjs_elements_for_types' do
    it 'can deal with different combinations of hash structures' do
      content = {
        'elt1' => 'string element',
        'elt2' => { 'type' => { 'resolvedName' => 'ImageMultiloc' }, 'props' => 'elt2-props' },
        'elt3' => { 'type' => 'div', 'props' => 'elt3-props' },
        'elt4' => { 'type' => { 'resolvedName' => 'Image' }, 'props' => 'elt4-props' }
      }
      images = service.select_craftjs_elements_for_types content, %w[Image ImageMultiloc]
      expect(images).to eq [
        { 'type' => { 'resolvedName' => 'ImageMultiloc' }, 'props' => 'elt2-props' },
        { 'type' => { 'resolvedName' => 'Image' }, 'props' => 'elt4-props' }
      ]
    end
  end

  describe 'clean_layouts_when_publication_deleted on the homepage' do
    let(:project1) { create(:project) }
    let(:project2) { create(:project) }
    let(:project_folder) { create(:project_folder) }

    let(:craftjs) do
      {
        ROOT: {
          type: 'div',
          nodes: %w[
            hjDFRYnSaG
            nUOW77iNcW
            lsKEOMxTkR
            Dtg42sYnM
            ffJQERoXGy
          ],
          props: {
            id: 'e2e-content-builder-frame'
          },
          custom: {},
          hidden: false,
          isCanvas: true,
          displayName: 'div',
          linkedNodes: {}
        },
        hjDFRYnSaG: {
          type: {
            resolvedName: 'Spotlight'
          },
          nodes: [],
          props: {
            publicationId: project2.id,
            titleMultiloc: {
              en: 'Project 2'
            },
            publicationType: 'project',
            buttonTextMultiloc: {
              en: 'Look at this project!'
            },
            descriptionMultiloc: {
              en: 'this widget should NOT be deleted'
            }
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Spotlight',
          linkedNodes: {}
        },
        nUOW77iNcW: {
          type: {
            resolvedName: 'Selection'
          },
          nodes: [],
          props: {
            titleMultiloc: {
              en: 'Projects and folders'
            },
            adminPublicationIds: [
              project2.admin_publication.id,
              project1.admin_publication.id,
              project_folder.admin_publication.id
            ]
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Selection',
          linkedNodes: {}
        },
        lsKEOMxTkR: {
          type: {
            resolvedName: 'Spotlight'
          },
          nodes: [],
          props: {
            publicationId: project1.id,
            titleMultiloc: {
              en: 'Project 1'
            },
            publicationType: 'project',
            buttonTextMultiloc: {
              en: 'Look at this project!'
            },
            descriptionMultiloc: {
              en: 'this widget should be deleted'
            }
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Spotlight',
          linkedNodes: {}
        },
        Dtg42sYnM: {
          type: {
            resolvedName: 'Selection'
          },
          nodes: [],
          props: {
            titleMultiloc: {
              en: 'Projects and folders'
            },
            adminPublicationIds: [
              project1.admin_publication.id,
              project2.admin_publication.id
            ]
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Selection',
          linkedNodes: {}
        },
        ffJQERoXGy: {
          type: {
            resolvedName: 'Spotlight'
          },
          nodes: [],
          props: {
            publicationId: project1.id,
            titleMultiloc: {
              en: 'Project 1'
            },
            publicationType: 'project',
            buttonTextMultiloc: {
              en: 'Look at this project!'
            },
            descriptionMultiloc: {
              en: 'this widget should be deleted'
            }
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Spotlight',
          linkedNodes: {}
        }
      }
    end

    let!(:layout) { create(:homepage_layout, craftjs_json: craftjs) }

    it "deletes a publication's admin_publication ID from Selection widget(s) in homepage layout" do
      service.clean_layouts_when_publication_deleted project1

      expect(layout.reload.craftjs_json['nUOW77iNcW']['props']['adminPublicationIds'])
        .to contain_exactly(project2.admin_publication.id, project_folder.admin_publication.id)

      expect(layout.reload.craftjs_json['Dtg42sYnM']['props']['adminPublicationIds'])
        .to contain_exactly(project2.admin_publication.id)
    end

    it 'deletes all Spotlight widgets for a publication from homepage layout' do
      service.clean_layouts_when_publication_deleted project1

      expect(layout.reload.craftjs_json['ROOT']['nodes']).to eq %w[hjDFRYnSaG nUOW77iNcW Dtg42sYnM]

      expect(layout.reload.craftjs_json).to have_key 'hjDFRYnSaG'
      expect(layout.reload.craftjs_json).not_to have_key 'lsKEOMxTkR'
      expect(layout.reload.craftjs_json).not_to have_key 'ffJQERoXGy'
    end

    it 'removes a Spotlight inside a column from that column, leaving no dangling reference' do
      root = { 'type' => 'div', 'parent' => nil, 'nodes' => %w[COLUMNS], 'linkedNodes' => {}, 'props' => {},
               'isCanvas' => true, 'custom' => {}, 'hidden' => false, 'displayName' => 'div' }
      nested = create(:homepage_layout, craftjs_json: {
        'ROOT' => root,
        'COLUMNS' => node('TwoColumn', parent: 'ROOT', linked_nodes: { 'left' => 'LEFT', 'right' => 'RIGHT' }),
        'LEFT' => node('Container', parent: 'COLUMNS', nodes: %w[SPOT], is_canvas: true),
        'RIGHT' => node('Container', parent: 'COLUMNS', is_canvas: true),
        'SPOT' => spotlight('LEFT', project1)
      })

      service.clean_layouts_when_publication_deleted project1

      json = nested.reload.craftjs_json
      expect(json).not_to have_key('SPOT')
      expect(json['LEFT']['nodes']).to eq []
    end
  end

  describe 'clean_layouts_when_publication_deleted on other pages' do
    let(:project) { create(:project) }
    # Widgets sit below ROOT and one Spotlight sits in a column: the old cleanup removed a
    # Spotlight's id from ROOT's `nodes` only, leaving a dangling reference in any other parent.
    let(:craftjs) do
      {
        'ROOT' => node('CustomPageRoot', parent: nil, nodes: %w[BODY], is_canvas: true),
        'BODY' => node('CustomPageBody', parent: 'ROOT', nodes: %w[SPOT_TOP COLUMNS SELECTION SPOT_OTHER], is_canvas: true),
        'SPOT_TOP' => spotlight('BODY', project),
        'COLUMNS' => node('TwoColumn', parent: 'BODY', linked_nodes: { 'left' => 'LEFT', 'right' => 'RIGHT' }),
        'LEFT' => node('Container', parent: 'COLUMNS', nodes: %w[SPOT_NESTED], is_canvas: true),
        'RIGHT' => node('Container', parent: 'COLUMNS', is_canvas: true),
        'SPOT_NESTED' => spotlight('LEFT', project),
        'SELECTION' => node('Selection', parent: 'BODY', props: {
          'titleMultiloc' => {},
          'adminPublicationIds' => [project.admin_publication.id, other_project.admin_publication.id]
        }),
        'SPOT_OTHER' => spotlight('BODY', other_project)
      }
    end
    let(:other_project) { create(:project) }

    where(:code) do
      [
        [ContentBuilder::CustomPageLayoutService::CODE],
        [ContentBuilder::LayoutProvisioningService::FOLDER_LAYOUT_CODE]
      ]
    end

    with_them do
      let!(:layout) { create(:layout, code: code, content_buildable: nil, craftjs_json: craftjs) }

      before { service.clean_layouts_when_publication_deleted(project) }

      it 'removes the Spotlights for the publication, including one inside a column' do
        json = layout.reload.craftjs_json

        expect(json).not_to have_key('SPOT_TOP')
        expect(json).not_to have_key('SPOT_NESTED')
        expect(json).to have_key('SPOT_OTHER')
      end

      it 'removes each Spotlight from its own parent, leaving no dangling reference' do
        json = layout.reload.craftjs_json

        expect(json['BODY']['nodes']).to eq %w[COLUMNS SELECTION SPOT_OTHER]
        expect(json['LEFT']['nodes']).to eq []
      end

      it 'drops the publication from Selection widgets' do
        expect(layout.reload.craftjs_json.dig('SELECTION', 'props', 'adminPublicationIds'))
          .to eq [other_project.admin_publication.id]
      end
    end

    it 'removes a Spotlight showing a deleted folder' do
      folder = create(:project_folder)
      json = craftjs.merge('SPOT_TOP' => spotlight('BODY', folder).deep_merge('props' => { 'publicationType' => 'folder' }))
      layout = create(:layout, code: ContentBuilder::CustomPageLayoutService::CODE, content_buildable: nil, craftjs_json: json)

      service.clean_layouts_when_publication_deleted(folder)

      expect(layout.reload.craftjs_json).not_to have_key('SPOT_TOP')
      expect(layout.reload.craftjs_json['BODY']['nodes']).not_to include('SPOT_TOP')
    end

    it 'cleans a layout even when an unrelated widget fails validation' do
      layout = create(:layout, code: ContentBuilder::CustomPageLayoutService::CODE, content_buildable: nil, craftjs_json: craftjs)
      invalid = craftjs.merge('EMBED' => node('IframeMultiloc', parent: 'BODY', props: { 'url' => '' }))
      invalid['BODY']['nodes'] += %w[EMBED]
      layout.update_column(:craftjs_json, invalid)

      expect { service.clean_layouts_when_publication_deleted(project) }.not_to raise_error
      expect(layout.reload.craftjs_json).not_to have_key('SPOT_TOP')
      expect(layout.reload.craftjs_json).to have_key('EMBED')
    end

    it 'drops a Spotlight whose parent is missing from the graph, without raising' do
      layout = create(:layout, code: ContentBuilder::CustomPageLayoutService::CODE, content_buildable: nil, craftjs_json: craftjs)
      layout.update_column(:craftjs_json, craftjs.merge('SPOT_TOP' => spotlight('GONE', project)))

      expect { service.clean_layouts_when_publication_deleted(project) }.not_to raise_error
      expect(layout.reload.craftjs_json).not_to have_key('SPOT_TOP')
    end

    it 'does not write a layout that does not reference the publication' do
      layout = create(:layout, code: ContentBuilder::CustomPageLayoutService::CODE, content_buildable: nil, craftjs_json: craftjs)
      unrelated = create(:project)

      expect { service.clean_layouts_when_publication_deleted(unrelated) }
        .not_to(change { layout.reload.craftjs_json })
    end

    it 'leaves layouts of other codes alone' do
      layout = create(:layout, code: 'project_page', content_buildable: nil, craftjs_json: craftjs)

      expect { service.clean_layouts_when_publication_deleted(project) }
        .not_to(change { layout.reload.craftjs_json })
    end
  end

  describe 'clean_project_page_when_survey_phase_removed' do
    let(:project) { create(:project) }
    let(:survey) { create(:phase, :standalone, project: project) }
    let(:other_survey) { create(:phase, :standalone, project: project) }
    let(:craftjs) do
      {
        'ROOT' => node('ProjectPageRoot', parent: nil, nodes: %w[BODY], is_canvas: true),
        'BODY' => node('ProjectPageBody', parent: 'ROOT', nodes: %w[COLUMNS SURVEY_OTHER], is_canvas: true),
        'COLUMNS' => node('TwoColumn', parent: 'BODY', linked_nodes: { 'left' => 'LEFT', 'right' => 'RIGHT' }),
        'LEFT' => node('Container', parent: 'COLUMNS', nodes: %w[SURVEY], is_canvas: true),
        'RIGHT' => node('Container', parent: 'COLUMNS', is_canvas: true),
        'SURVEY' => survey_widget('LEFT', survey),
        'SURVEY_OTHER' => survey_widget('BODY', other_survey)
      }
    end
    let!(:layout) do
      create(:layout, code: ContentBuilder::ProjectPageLayoutService::CODE, content_buildable: project, craftjs_json: craftjs)
    end

    def survey_widget(parent, phase)
      node('ExtraSurveysWidget', parent: parent, props: { 'surveyPhaseId' => phase.id })
    end

    it 'removes the widgets showing the survey from their own parent, and keeps the others' do
      service.clean_project_page_when_survey_phase_removed(survey)

      json = layout.reload.craftjs_json
      expect(json).not_to have_key('SURVEY')
      expect(json['LEFT']['nodes']).to eq []
      expect(json).to have_key('SURVEY_OTHER')
    end

    it 'cleans the layout even when an unrelated widget fails validation' do
      invalid = craftjs.merge('EMBED' => node('IframeMultiloc', parent: 'BODY', props: { 'url' => '' }))
      invalid['BODY']['nodes'] += %w[EMBED]
      layout.update_column(:craftjs_json, invalid)

      expect { service.clean_project_page_when_survey_phase_removed(survey) }.not_to raise_error
      expect(layout.reload.craftjs_json).not_to have_key('SURVEY')
      expect(layout.reload.craftjs_json).to have_key('EMBED')
    end

    it 'drops a widget whose parent is missing from the graph, without raising' do
      layout.update_column(:craftjs_json, craftjs.merge('SURVEY' => survey_widget('GONE', survey)))

      expect { service.clean_project_page_when_survey_phase_removed(survey) }.not_to raise_error
      expect(layout.reload.craftjs_json).not_to have_key('SURVEY')
    end

    it 'leaves the project pages of other projects alone' do
      other_layout = create(
        :layout,
        code: ContentBuilder::ProjectPageLayoutService::CODE,
        content_buildable: create(:project),
        craftjs_json: craftjs
      )

      expect { service.clean_project_page_when_survey_phase_removed(survey) }
        .not_to(change { other_layout.reload.craftjs_json })
    end

    describe 'as a side effect of the phase lifecycle' do
      let(:user) { create(:admin) }

      it 'runs when the survey moves onto the timeline' do
        survey.update!(placement_type: 'on_timeline')
        SideFxPhaseService.new.after_update(survey, user)

        expect(layout.reload.craftjs_json).not_to have_key('SURVEY')
      end

      it 'does not run when the placement did not change' do
        survey.update!(title_multiloc: { 'en' => 'Renamed' })
        SideFxPhaseService.new.after_update(survey, user)

        expect(layout.reload.craftjs_json).to have_key('SURVEY')
      end

      it 'does not run when a survey moves off the timeline' do
        timeline_survey = create(:native_survey_phase, project: project)
        layout.update_column(:craftjs_json, craftjs.merge('SURVEY' => survey_widget('LEFT', timeline_survey)))
        timeline_survey.update!(placement_type: 'standalone')
        SideFxPhaseService.new.after_update(timeline_survey, user)

        expect(layout.reload.craftjs_json).to have_key('SURVEY')
      end

      it 'runs when the survey is deleted' do
        survey.destroy!
        SideFxPhaseService.new.after_destroy(survey, user)

        expect(layout.reload.craftjs_json).not_to have_key('SURVEY')
      end
    end
  end
end

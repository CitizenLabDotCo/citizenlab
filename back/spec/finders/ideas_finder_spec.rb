# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:finder) { described_class.new(params, **options) }

  let_it_be(:timeline_project) { create(:project_with_phases) }
  let_it_be(:ideas) { create_list(:idea_with_topics, 5, project: timeline_project) }

  let(:params) { {} }
  let(:options) { {} }
  let(:result_record_ids) { finder.find_records.pluck(:id) }

  before_all { create(:idea_status_proposed) }

  context 'default scope' do
    it 'filters out non-ideation inputs' do
      Idea.destroy_all
      expected_input_ids = initialize_inputs_for_scope_filtering

      expect(result_record_ids).to match_array expected_input_ids
    end
  end

  context 'custom scope' do
    before { @scope = Idea }

    let(:options) { { scope: @scope } }

    it 'filters out non-ideation inputs' do
      Idea.destroy_all
      ideation_input_ids = initialize_inputs_for_scope_filtering
      @scope = @scope.where.not(id: ideation_input_ids.first)

      expect(result_record_ids).to match_array ideation_input_ids.drop(1)
    end
  end

  context 'when no params or options are received' do
    it 'returns all' do
      expect(finder.find_records.count).to eq Idea.count
    end
  end

  describe '#transitive_condition' do
    let!(:non_transitive_ids) { create_pair(:proposal).pluck(:id) }

    it 'returns transitive ideas' do
      params[:transitive] = true
      expect(result_record_ids).to match_array ideas.map(&:id)
    end

    it 'returns non-transitive ideas' do
      params[:transitive] = 'false'
      expect(result_record_ids).to match_array non_transitive_ids
    end

    it 'does not filter records' do
      params.delete(:transitive)
      expect(result_record_ids).to match_array ideas.map(&:id) + non_transitive_ids
    end
  end

  describe '#projects_condition' do
    let(:project_ids) { [Project.first.id] }
    let(:expected_record_ids) { Idea.where(project_id: project_ids).pluck(:id) }

    before do
      params[:projects] = project_ids
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#project_condition' do
    let(:project_id) { Project.pick(:id) }
    let(:expected_record_ids) { Idea.where(project_id: project_id).pluck(:id) }

    before do
      params[:project] = project_id
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#basket_condition' do
    let(:idea_ids) { timeline_project.idea_ids.shuffle.take(2) }
    let(:basket) { create(:basket, idea_ids: idea_ids) }
    let(:params) { { basket_id: basket.id } }

    it 'filters ideas by basket' do
      expect(result_record_ids).to be_present
      expect(result_record_ids).to match_array idea_ids
    end

    context 'when the basket is empty' do
      let(:idea_ids) { [] }

      it 'returns no records' do
        expect(result_record_ids).to eq []
      end
    end
  end

  describe '#topics_condition' do
    let(:topic_ids) { Topic.first(2).pluck(:id) }
    let(:expected_record_ids) do
      Idea.includes(:ideas_topics).where(ideas_topics: { topic_id: topic_ids }).distinct.pluck(:id)
    end

    before do
      params[:topics] = topic_ids
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#phase_condition' do
    let(:phase_id) { Phase.pick(:id) }
    let(:expected_record_ids) { Idea.includes(:ideas_phases).where(ideas_phases: { phase_id: phase_id }).pluck(:id) }

    before do
      params[:phase] = phase_id
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#idea_status_condition' do
    let(:idea_status_id) { IdeaStatus.pick(:id) }
    let(:expected_record_ids) { Idea.where(idea_status_id: idea_status_id).pluck(:id) }

    before do
      params[:idea_status] = idea_status_id
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#project_publication_status_condition' do
    let(:publication_status) { 'draft' }
    let(:expected_record_ids) do
      Idea.includes(project: :admin_publication)
        .where(projects: { admin_publications: { publication_status: publication_status } })
        .pluck(:id)
    end

    before do
      params[:project_publication_status] = publication_status
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#feedback_needed_condition' do
    let(:expected_record_ids) { Idea.feedback_needed.pluck(:id) }

    before do
      params[:feedback_needed] = true
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#search_condition' do
    let(:first_idea_title) { Idea.first.title_multiloc['en'] }
    let(:expected_record_ids) { Idea.search_by_all(first_idea_title).pluck(:id) }

    before do
      params[:search] = first_idea_title
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#bounding_box_condition' do
    let(:bounding_box) { '[51.208758,3.224363,50.000667,5.715281]' }
    let(:expected_record_ids) { Idea.with_bounding_box(bounding_box).pluck(:id) }

    before do
      params[:bounding_box] = bounding_box
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#filter_trending_condition' do
    let(:expected_record_ids) { TrendingIdeaService.new.filter_trending(Idea.all).pluck(:id) }

    before do
      params[:filter_trending] = true
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#author_condition' do
    let(:author_id) { User.first.id }
    let(:expected_record_ids) { Idea.where(author_id: author_id).pluck(:id) }

    before do
      params[:author] = author_id
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#publication_status_condition' do
    let(:publication_status) { 'draft' }
    let(:expected_record_ids) { Idea.where(publication_status: publication_status).pluck(:id) }

    before do
      params[:publication_status] = publication_status
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#filter_can_moderate_condition' do
    let(:user_role_service) { finder.send(:user_role_service) }
    let(:can_moderate) { true }

    before do
      params[:filter_can_moderate] = can_moderate
      create(:idea)
    end

    context 'without current user and can_moderate is true' do
      it 'returns an empty array' do
        expect(result_record_ids).to eq []
      end
    end

    context 'without current user and can_moderate is false' do
      let(:can_moderate) { false }

      it 'returns all ideas' do
        expect(result_record_ids).to match_array Idea.ids
      end
    end

    context 'with current user and can_moderate is true' do
      let(:user) { create(:user) }
      let(:options) { { current_user: user } }
      let(:moderatable_project) { create(:single_phase_ideation_project) }
      let(:moderatable_projects) { Project.where(id: moderatable_project.id) }
      let!(:idea1) { create(:idea, project: moderatable_project) }

      before do
        allow(user_role_service).to receive(
          :moderatable_projects
        ).with(
          user
        ).and_return moderatable_projects

        create(:idea)
      end

      it 'returns the correct records' do
        expect(user_role_service).to receive(:moderatable_projects)
        expect(result_record_ids).to eq [idea1.id]
      end
    end

    context 'with current user and can_moderate is false' do
      let(:user) { create(:user) }
      let(:options) { { current_user: user } }
      let(:can_moderate) { false }

      it 'returns all ideas' do
        expect(result_record_ids).to match_array Idea.ids
      end
    end
  end

  def initialize_inputs_for_scope_filtering
    timeline_project = create(:project)
    ideation_phase = create(:phase, project: timeline_project, start_at: (Time.zone.today - 1.month), end_at: (Time.zone.today - 1.day))
    voting_phase = create(:budgeting_phase, project: timeline_project, start_at: Time.zone.today, end_at: (Time.zone.today + 1.day))
    survey_phase = create(:native_survey_phase, project: timeline_project, start_at: (Time.zone.today + 2.days), end_at: (Time.zone.today + 1.month))

    create(:idea, project: timeline_project, phases: [survey_phase], creation_phase: survey_phase)

    [
      create(:idea, project: timeline_project, phases: [ideation_phase]).id,
      create(:idea, project: timeline_project, phases: [voting_phase]).id,
      create(:idea, project: timeline_project).id,
      create(:proposal).id
    ]
  end
end

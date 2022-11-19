# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:finder) { described_class.new(params, **options) }

  let(:params) { {} }
  let(:options) { {} }
  let(:result_record_ids) { finder.find_records.pluck(:id) }
  let(:timeline_project) { create :project_with_phases }
  let!(:ideas) { create_list :idea_with_topics, 5, project: timeline_project }

  before_all do
    IdeaStatus.create_defaults
  end

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

  context 'when passing a sort param' do
    let(:params) { { sort: sort } }

    describe '#sort_scopes (new)' do
      let(:sort) { 'new' }
      let(:expected_record_ids) { Idea.order_new(:desc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (-new)' do
      let(:sort) { '-new' }
      let(:expected_record_ids) { Idea.order_new(:asc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (status)' do
      let(:sort) { 'status' }
      let(:expected_record_ids) { Idea.order_status(:asc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (-status)' do
      let(:sort) { '-status' }
      let(:expected_record_ids) { Idea.order_status(:desc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (trending)' do
      let(:sort) { 'trending' }

      it 'returns the ids in trending order' do
        allow_any_instance_of(TrendingIdeaService).to receive(:sort_trending).with(ideas).and_return ideas
        expect(result_record_ids).to eq ideas.map(&:id)
      end
    end

    describe '#sort_scopes (-trending)' do
      let(:sort) { '-trending' }

      it 'returns the ids in reverse trending order' do
        allow_any_instance_of(TrendingIdeaService).to receive(:sort_trending).with(ideas).and_return ideas
        expect(result_record_ids).to eq ideas.map(&:id).reverse
      end
    end

    describe '#sort_scopes (author_name)' do
      let(:sort) { 'author_name' }
      let(:expected_record_ids) do
        Idea.includes(:author).order('users.first_name ASC', 'users.last_name ASC').pluck(:id)
      end

      context 'when joining author' do
        let(:options) { { includes: %i[author] } }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end
    end

    describe '#sort_scopes (-author_name)' do
      let(:sort) { '-author_name' }
      let(:expected_record_ids) do
        Idea.includes(:author).order('users.first_name DESC', 'users.last_name DESC').pluck(:id)
      end

      context 'when joining author' do
        let(:options) { { includes: %i[author] } }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end
    end

    describe '#sort_scopes (popular)' do
      let(:sort) { 'popular' }
      let(:expected_record_ids) { Idea.order_popular(:desc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (-popular)' do
      let(:sort) { '-popular' }
      let(:expected_record_ids) { Idea.order_popular(:asc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (random)' do
      let(:sort) { 'random' }
      let(:expected_record_ids) { Idea.order_random.pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (upvotes_count)' do
      let(:sort) { 'upvotes_count' }
      let(:expected_record_ids) { Idea.order(upvotes_count: :desc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (-upvotes_count)' do
      let(:sort) { '-upvotes_count' }
      let(:expected_record_ids) { Idea.order(upvotes_count: :asc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (downvotes_count)' do
      let(:sort) { 'downvotes_count' }
      let(:expected_record_ids) { Idea.order(downvotes_count: :desc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (-downvotes_count)' do
      let(:sort) { '-downvotes_count' }
      let(:expected_record_ids) { Idea.order(downvotes_count: :asc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (baskets_count)' do
      let(:sort) { 'baskets_count' }
      let(:expected_record_ids) { Idea.order(baskets_count: :desc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (-baskets_count)' do
      let(:sort) { '-baskets_count' }
      let(:expected_record_ids) { Idea.order(baskets_count: :asc).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end
  end

  context 'when no params or options are received' do
    it 'returns all' do
      expect(finder.find_records.count).to eq Idea.count
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
      let(:moderatable_project) { create(:continuous_project) }
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
    timeline_project = create :project, process_type: 'timeline'
    create :phase, project: timeline_project, participation_method: 'ideation', start_at: (Time.zone.today - 1.month), end_at: (Time.zone.today - 1.day)
    create :phase, project: timeline_project, participation_method: 'budgeting', start_at: Time.zone.today, end_at: (Time.zone.today + 1.day)
    survey_phase = create :phase, project: timeline_project, participation_method: 'native_survey', start_at: (Time.zone.today + 2.days), end_at: (Time.zone.today + 1.month)
    ideation_project = create :continuous_project, participation_method: 'ideation'
    budgeting_project = create :continuous_budgeting_project
    survey_project = create :continuous_project, participation_method: 'native_survey'

    create :idea, project: timeline_project, creation_phase: survey_phase
    create :idea, project: survey_project

    [
      create(:idea, project: ideation_project).id,
      create(:idea, project: budgeting_project).id,
      create(:idea, project: timeline_project).id
    ]
  end
end

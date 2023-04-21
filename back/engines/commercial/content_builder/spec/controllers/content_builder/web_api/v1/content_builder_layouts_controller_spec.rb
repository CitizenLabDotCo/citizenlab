# frozen_string_literal: true

require 'rails_helper'

# These tests do not verify the response bodies. See the acceptance tests for that.
# The purpose of these tests is to describe that the side fx service hooks are triggered.

RSpec.describe ::ContentBuilder::WebApi::V1::ContentBuilderLayoutsController do
  routes { ContentBuilder::Engine.routes }
  let(:user) { create(:admin) }

  before do
    token = Knock::AuthToken.new(payload: user.to_token_payload).token
    request.headers['Authorization'] = "Bearer #{token}"
    request.headers['Content-Type'] = 'application/json'
  end

  describe 'upsert for create' do
    let(:project) { create(:project) }
    let(:project_id) { project.id }
    let(:code) { 'project_description' }

    context 'when saving is successful' do
      it 'triggers before_create and after_create hooks on the side fx service around saving the layout' do
        swapped_multiloc = { 'en' => { 'swapped_data_images' => {} } }
        not_swapped_multiloc = { 'en' => { 'not_swapped_data_images' => {} } }
        attributes = {
          content_buildable_type: Project.name,
          content_buildable_id: project_id,
          code: code,
          enabled: true,
          craftjs_jsonmultiloc: not_swapped_multiloc
        }
        layout = ::ContentBuilder::Layout.new(attributes)
        expect(::ContentBuilder::Layout).to receive(:new).with(attributes).ordered.and_return layout
        service = controller.send(:side_fx_service)

        expect(service).to receive(:before_create).with(
          layout,
          user
        ).ordered.and_call_original
        expect(layout).to receive(:save).ordered.and_call_original
        expect(service).to receive(:after_create).with(
          layout,
          user
        ).ordered.and_call_original
        allow_any_instance_of(ContentBuilder::LayoutImageService).to receive(:swap_data_images).and_return(
          swapped_multiloc
        )

        params = {
          project_id: project_id,
          code: code,
          content_builder_layout: {
            enabled: true,
            craftjs_jsonmultiloc: not_swapped_multiloc
          }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status(:created)
        expect(response.content_type).to eq 'application/json; charset=utf-8'
        expect(layout.reload.craftjs_jsonmultiloc).to eq swapped_multiloc
      end

      it 'sanitizes HTML inside text elements' do
        expected_multiloc = { 'en' => { 'sanitized_craftjson' => {} } }
        expect_any_instance_of(ContentBuilder::LayoutSanitizationService).to receive(:sanitize_multiloc).and_return(
          expected_multiloc
        )

        params = {
          project_id: project_id,
          code: code,
          content_builder_layout: { craftjs_jsonmultiloc: { 'en' => { 'unsanitized_craftjson' => {} } } }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status :created
        expect(JSON.parse(response.body).dig('data', 'attributes', 'craftjs_jsonmultiloc')).to eq(expected_multiloc)
      end
    end

    context 'when saving is unsuccessful' do
      it 'triggers the before_create hook before saving, but not the after_create hook after saving' do
        attributes = {
          content_buildable_type: Project.name,
          content_buildable_id: project_id,
          code: code,
          enabled: true
        }
        layout = ::ContentBuilder::Layout.new(attributes)
        expect(::ContentBuilder::Layout).to receive(:new).with(attributes).ordered.and_return layout
        service = controller.send(:side_fx_service)

        expect(service).to receive(:before_create).with(
          an_instance_of(::ContentBuilder::Layout),
          user
        ).ordered.and_call_original
        expect(layout).to receive(:save).ordered.and_return false
        expect(service).not_to receive(:after_create)

        params = {
          project_id: project_id,
          code: code,
          content_builder_layout: { enabled: true }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to eq 'application/json; charset=utf-8'
      end
    end
  end

  describe 'upsert for update' do
    let(:layout) { create(:layout) }
    let(:project_id) { layout.content_buildable_id }
    let(:code) { layout.code }

    context 'when saving is successful' do
      it 'triggers the before_update and after_update hooks on the side fx service around saving the layout' do
        attributes = {
          content_buildable_type: Project.name,
          content_buildable_id: project_id,
          code: code
        }
        service = controller.send(:side_fx_service)

        expect(::ContentBuilder::Layout).to receive(:find_by!).with(attributes).ordered.and_return layout
        expect(service).to receive(:before_update).with(
          layout,
          user
        ).ordered.and_call_original
        expect(layout).to receive(:save).ordered.and_call_original
        expect(service).to receive(:after_update).with(
          layout,
          user
        ).ordered.and_call_original
        swapped_multiloc = { 'en' => { 'swapped_data_images' => {} } }
        allow_any_instance_of(ContentBuilder::LayoutImageService).to receive(:swap_data_images).and_return(
          swapped_multiloc
        )

        params = {
          project_id: project_id,
          code: code,
          content_builder_layout: {
            enabled: false,
            craftjs_jsonmultiloc: { 'en' => { 'not_swapped_data_images' => {} } }
          }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq 'application/json; charset=utf-8'
        expect(layout.reload.craftjs_jsonmultiloc).to eq swapped_multiloc
      end

      it 'sanitizes HTML inside text elements' do
        expected_multiloc = { 'en' => { 'sanitized_craftjson' => {} } }
        layout # also calls sanitize_multiloc (to make the expectation below work)
        expect_any_instance_of(ContentBuilder::LayoutSanitizationService).to receive(:sanitize_multiloc).and_return(
          expected_multiloc
        )

        params = {
          project_id: project_id,
          code: code,
          content_builder_layout: { craftjs_jsonmultiloc: { 'en' => { 'unsanitized_craftjson' => {} } } }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status :ok
        expect(JSON.parse(response.body).dig('data', 'attributes', 'craftjs_jsonmultiloc')).to eq(expected_multiloc)
      end
    end

    context 'when saving is unsuccessful' do
      it 'triggers the before_update hook before saving, but not the after_update hook after saving' do
        attributes = {
          content_buildable_type: Project.name,
          content_buildable_id: project_id,
          code: code
        }
        service = controller.send(:side_fx_service)

        expect(::ContentBuilder::Layout).to receive(:find_by!).with(attributes).ordered.and_return layout
        expect(service).to receive(:before_update).with(
          layout,
          user
        ).ordered.and_call_original
        expect(layout).to receive(:save).ordered.and_return false
        expect(service).not_to receive(:after_update)

        params = {
          project_id: project_id,
          code: code,
          content_builder_layout: { enabled: false }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to eq 'application/json; charset=utf-8'
      end
    end
  end

  describe 'destroy' do
    let(:layout) { create(:layout) }
    let(:project_id) { layout.content_buildable_id }
    let(:code) { layout.code }

    context 'when destroying is successful' do
      it 'triggers before_destroy and after_destroy hooks on the side fx service around destroying the layout' do
        attributes = {
          content_buildable_type: Project.name,
          content_buildable_id: project_id,
          code: code
        }
        service = controller.send(:side_fx_service)
        expect(::ContentBuilder::Layout).to receive(:find_by!).with(attributes).ordered.and_return layout

        expect(service).to receive(:before_destroy).with(
          layout,
          user
        ).ordered.and_call_original
        expect(layout).to receive(:destroy).ordered.and_call_original
        expect(service).to receive(:after_destroy).with(
          layout,
          user
        ).ordered.and_call_original

        params = {
          project_id: project_id,
          code: code
        }
        delete :destroy, params: params, format: :json
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq 'application/json'
      end
    end

    context 'when destroying is unsuccessful' do
      it 'triggers the before_destroy hook before destroying, but not the after_destroy hook after destroying' do
        attributes = {
          content_buildable_type: Project.name,
          content_buildable_id: project_id,
          code: code
        }
        service = controller.send(:side_fx_service)
        expect(::ContentBuilder::Layout).to receive(:find_by!).with(attributes).ordered.and_return layout

        expect(service).to receive(:before_destroy).with(
          layout,
          user
        ).ordered.and_call_original
        expect(layout).to receive(:destroy).ordered.and_return layout
        expect(layout).to receive(:destroyed?).ordered.and_return false
        expect(service).not_to receive(:after_destroy)

        params = {
          project_id: project_id,
          code: code
        }
        delete :destroy, params: params, format: :json
        expect(response).to have_http_status(:internal_server_error)
        expect(response.content_type).to eq 'application/json'
      end
    end
  end
end

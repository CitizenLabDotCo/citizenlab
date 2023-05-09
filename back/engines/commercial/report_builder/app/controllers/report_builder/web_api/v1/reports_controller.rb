# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class ReportsController < ::ApplicationController
        skip_before_action :authenticate_user

        def index
          reports = policy_scope(ReportBuilder::Report)
          reports = paginate(reports)

          render json: linked_json(reports, ReportSerializer, params: fastjson_params)
        end

        def show
          render json: serialize_report(report)
        end

        def create
          report = authorize(ReportBuilder::Report.new(create_params))
          side_fx_service.before_create(report, current_user)
          return send_unprocessable_entity(report) unless report.save

          side_fx_service.after_create(report, current_user)
          render json: serialize_report(report), status: :created
        end

        def update
          report.attributes = update_params
          side_fx_service.before_update(report, current_user)
          return send_unprocessable_entity(report) unless report.save

          side_fx_service.after_update(report, current_user)
          render json: serialize_report(report), status: :ok
        end

        def destroy
          side_fx_service.before_destroy(report, current_user)
          if report.destroy
            side_fx_service.after_destroy(report, current_user)
            head :no_content
          else
            head :internal_server_error
          end
        end

        def layout
          render json: ContentBuilder::WebApi::V1::LayoutSerializer.new(
            report.layout,
            params: fastjson_params
          ).serializable_hash.to_json
        end

        private

        def report
          @report ||= authorize(
            ReportBuilder::Report.includes(:layout).find(params[:id])
          )
        end

        def create_params
          @create_params ||= {
            'owner' => current_user,
            'layout_attributes' => {
              'craftjs_jsonmultiloc' => {},
              'enabled' => true,
              'code' => 'report'
            }
          }.deep_merge(shared_params)
        end

        def update_params
          @update_params ||= shared_params.tap do |parameters|
            if parameters.key?(:layout_attributes)
              parameters[:layout_attributes][:id] = report.layout.id

              craftjs_jsonmultiloc = parameters.dig(:layout_attributes, :craftjs_jsonmultiloc)
              craftjs_jsonmultiloc.reverse_merge!(report.layout.craftjs_jsonmultiloc)
            end
          end
        end

        def shared_params
          parameters = params
            .require(:report)
            .permit(
              :name,
              layout: [craftjs_jsonmultiloc: CL2_SUPPORTED_LOCALES.map { |locale| { locale => {} } }]
            )

          parameters[:layout_attributes] = parameters.delete(:layout) if parameters.key?(:layout)
          parameters
        end

        def serialize_report(report)
          options = { params: fastjson_params, include: [:layout] }
          ReportSerializer.new(report, options).serializable_hash.to_json
        end

        def side_fx_service
          @side_fx_service ||= ::ReportBuilder::SideFxReportService.new
        end
      end
    end
  end
end

# frozen_string_literal: true

module Insights
  module WebApi::V1
    class NetworksController < ::ApplicationController
      def show
        render json: network, status: :ok
      end

      private

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:scope).find(params.require(:view_id)),
          :show?
        )
      end

      def source

      end

      def network
        {
          data: {
            id: "network-of-#{view.id}",
            type: 'network',
            attributes: {
              nodes: [
                {
                  id: "0",
                  name: "zhang, wei, guang",
                  val: 140,
                  cluster_id: nil,
                  color: "#0ff1ce"
                },
                {
                  cluster_id: "0",
                  id: "zhang",
                  name: "zhang",
                  val: 0.26666666666666666,
                  color: "#0ff1ce"
                },
                {
                  cluster_id: "0",
                  id: "wei",
                  name: "wei",
                  val: 0.13333333333333333,
                  color: "#0ff1ce"
                },
                {
                  cluster_id: "0",
                  id: "guang",
                  name: "guang",
                  val: 0.13333333333333333,
                  color: "#0ff1ce"
                },
                {
                  cluster_id: "0",
                  id: "zhi",
                  name: "zhi",
                  val: 0.13333333333333333,
                  color: "#0ff1ce"
                },
                {
                  id: "1",
                  name: "people, income, tax",
                  val: 330,
                  cluster_id: nil,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "people",
                  name: "people",
                  val: 3.433333333333333,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "income",
                  name: "income",
                  val: 2.933333333333333,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "tax",
                  name: "tax",
                  val: 3.7,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "help",
                  name: "help",
                  val: 2.3,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "money",
                  name: "money",
                  val: 2.3,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "month",
                  name: "month",
                  val: 1.1666666666666667,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "pay",
                  name: "pay",
                  val: 2.033333333333333,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "homeless",
                  name: "homeless",
                  val: 1,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "afford",
                  name: "afford",
                  val: 0.9333333333333333,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "find",
                  name: "find",
                  val: 0.7666666666666667,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "stay",
                  name: "stay",
                  val: 0.8666666666666667,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "invest",
                  name: "invest",
                  val: 0.7,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "save",
                  name: "save",
                  val: 0.6,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "person",
                  name: "person",
                  val: 0.7333333333333333,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "invancouver",
                  name: "invancouver",
                  val: 0.5666666666666667,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "lease",
                  name: "lease",
                  val: 0.7,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "extra",
                  name: "extra",
                  val: 0.4666666666666667,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "process",
                  name: "process",
                  val: 0.3333333333333333,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "charge",
                  name: "charge",
                  val: 0.3333333333333333,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "debt",
                  name: "debt",
                  val: 0.6666666666666666,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "develop",
                  name: "develop",
                  val: 0.36666666666666664,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "homeowner",
                  name: "homeowner",
                  val: 0.6,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "wish",
                  name: "wish",
                  val: 0.3333333333333333,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "kid",
                  name: "kid",
                  val: 0.2,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "earn",
                  name: "earn",
                  val: 0.3,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "step",
                  name: "step",
                  val: 0.26666666666666666,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "peryear",
                  name: "peryear",
                  val: 0.26666666666666666,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "life",
                  name: "life",
                  val: 0.16666666666666666,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "difficult",
                  name: "difficult",
                  val: 0.4666666666666667,
                  color: "#bada55"
                },
                {
                  cluster_id: "1",
                  id: "disability",
                  name: "disability",
                  val: 0.26666666666666666,
                  color: "#bada55"
                },
                {
                  id: "2",
                  name: "area, work, space",
                  val: 260,
                  cluster_id: nil,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "area",
                  name: "area",
                  val: 1.7333333333333334,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "work",
                  name: "work",
                  val: 1.3,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "space",
                  name: "space",
                  val: 1.3333333333333333,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "etc",
                  name: "etc",
                  val: 0.5666666666666667,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "place",
                  name: "place",
                  val: 0.8666666666666667,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "public",
                  name: "public",
                  val: 1.1,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "way",
                  name: "way",
                  val: 0.8666666666666667,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "private",
                  name: "private",
                  val: 0.7333333333333333,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "available",
                  name: "available",
                  val: 0.6333333333333333,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "currently",
                  name: "currently",
                  val: 0.4,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "social",
                  name: "social",
                  val: 0.7333333333333333,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "affordability",
                  name: "affordability",
                  val: 0.6333333333333333,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "individual",
                  name: "individual",
                  val: 0.4,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "care",
                  name: "care",
                  val: 0.43333333333333335,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "outside",
                  name: "outside",
                  val: 0.26666666666666666,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "health",
                  name: "health",
                  val: 0.3,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "quality",
                  name: "quality",
                  val: 0.5,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "day",
                  name: "day",
                  val: 0.3,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "source",
                  name: "source",
                  val: 0.16666666666666666,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "volunteer",
                  name: "volunteer",
                  val: 0.1,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "sector",
                  name: "sector",
                  val: 0.36666666666666664,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "investment",
                  name: "investment",
                  val: 0.6333333333333333,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "death",
                  name: "death",
                  val: 0.06666666666666667,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "bank",
                  name: "bank",
                  val: 0.16666666666666666,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "good",
                  name: "good",
                  val: 0.6666666666666666,
                  color: "#7fe5f0"
                },
                {
                  cluster_id: "2",
                  id: "hate",
                  name: "hate",
                  val: 0.16666666666666666,
                  color: "#7fe5f0"
                },
                {
                  id: "3",
                  name: "home, unit, family",
                  val: 380,
                  cluster_id: nil,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "home",
                  name: "home",
                  val: 4.933333333333334,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "unit",
                  name: "unit",
                  val: 2.4,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "family",
                  name: "family",
                  val: 2.2666666666666666,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "suite",
                  name: "suite",
                  val: 1.1,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "co",
                  name: "co",
                  val: 1.4,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "exist",
                  name: "exist",
                  val: 1.8,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "permit",
                  name: "permit",
                  val: 0.5,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "include",
                  name: "include",
                  val: 1.0333333333333334,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "single",
                  name: "single",
                  val: 0.9333333333333333,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "room",
                  name: "room",
                  val: 0.9,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "facility",
                  name: "facility",
                  val: 0.6,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "lot",
                  name: "lot",
                  val: 0.8666666666666667,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "living",
                  name: "living",
                  val: 1,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "large",
                  name: "large",
                  val: 1.0333333333333334,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "number",
                  name: "number",
                  val: 1,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "secondary",
                  name: "secondary",
                  val: 0.5333333333333333,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "urban",
                  name: "urban",
                  val: 0.4,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "child",
                  name: "child",
                  val: 0.43333333333333335,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "add",
                  name: "add",
                  val: 0.5,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "renovate",
                  name: "renovate",
                  val: 0.43333333333333335,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "funding",
                  name: "funding",
                  val: 0.5333333333333333,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "upgrade",
                  name: "upgrade",
                  val: 0.3,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "couple",
                  name: "couple",
                  val: 0.36666666666666664,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "standard",
                  name: "standard",
                  val: 0.43333333333333335,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "bridge",
                  name: "bridge",
                  val: 0.23333333333333334,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "come",
                  name: "come",
                  val: 0.3,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "condition",
                  name: "condition",
                  val: 0.43333333333333335,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "additional",
                  name: "additional",
                  val: 0.5,
                  color: "#ff80ed"
                },
                {
                  cluster_id: "3",
                  id: "size",
                  name: "size",
                  val: 0.4666666666666667,
                  color: "#ff80ed"
                },
                {
                  id: "4",
                  name: "rent, affordable, build",
                  val: 460,
                  cluster_id: nil,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "rent",
                  name: "rent",
                  val: 4.1,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "affordable",
                  name: "affordable",
                  val: 2.7666666666666666,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "build",
                  name: "build",
                  val: 2.8333333333333335,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "new",
                  name: "new",
                  val: 2.8,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "building",
                  name: "building",
                  val: 2.533333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "need",
                  name: "need",
                  val: 2.8,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "house",
                  name: "house",
                  val: 2,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "increase",
                  name: "increase",
                  val: 1.8,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "developer",
                  name: "developer",
                  val: 1.5666666666666667,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "require",
                  name: "require",
                  val: 1.3333333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "development",
                  name: "development",
                  val: 0.8,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "smoke",
                  name: "smoke",
                  val: 0.5333333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "household",
                  name: "household",
                  val: 0.5666666666666667,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "purpose",
                  name: "purpose",
                  val: 0.8666666666666667,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "design",
                  name: "design",
                  val: 0.5333333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "mortgage",
                  name: "mortgage",
                  val: 0.4666666666666667,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "purchase",
                  name: "purchase",
                  val: 0.8333333333333334,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "stock",
                  name: "stock",
                  val: 0.9333333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "especially",
                  name: "especially",
                  val: 0.5333333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "shaughnessy",
                  name: "shaughnessy",
                  val: 0.5333333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "condo",
                  name: "condo",
                  val: 0.9,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "close",
                  name: "close",
                  val: 0.7333333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "bedroom",
                  name: "bedroom",
                  val: 0.6,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "apartment",
                  name: "apartment",
                  val: 0.7333333333333333,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "tear",
                  name: "tear",
                  val: 0.5,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "control",
                  name: "control",
                  val: 0.7,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "supply",
                  name: "supply",
                  val: 0.43333333333333335,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "actually",
                  name: "actually",
                  val: 0.6666666666666666,
                  color: "#407294"
                },
                {
                  cluster_id: "4",
                  id: "certain",
                  name: "certain",
                  val: 0.4666666666666667,
                  color: "#407294"
                },
                {
                  id: "5",
                  name: "city, resident, fund",
                  val: 330,
                  cluster_id: nil,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "city",
                  name: "city",
                  val: 5,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "resident",
                  name: "resident",
                  val: 1.8333333333333333,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "fund",
                  name: "fund",
                  val: 1.7333333333333334,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "provide",
                  name: "provide",
                  val: 2.3666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "renter",
                  name: "renter",
                  val: 1.3,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "small",
                  name: "small",
                  val: 1.2333333333333334,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "use",
                  name: "use",
                  val: 1.1333333333333333,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "service",
                  name: "service",
                  val: 0.5333333333333333,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "benefit",
                  name: "benefit",
                  val: 0.8666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "revenue",
                  name: "revenue",
                  val: 0.8666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "homes",
                  name: "homes",
                  val: 0.8,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "free",
                  name: "free",
                  val: 1,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "loan",
                  name: "loan",
                  val: 0.6666666666666666,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "future",
                  name: "future",
                  val: 0.4666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "end",
                  name: "end",
                  val: 0.5666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "street",
                  name: "street",
                  val: 0.26666666666666666,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "temporary",
                  name: "temporary",
                  val: 0.8666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "business",
                  name: "business",
                  val: 0.8,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "current",
                  name: "current",
                  val: 0.6333333333333333,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "citizen",
                  name: "citizen",
                  val: 0.3333333333333333,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "tiny",
                  name: "tiny",
                  val: 0.6,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "interest",
                  name: "interest",
                  val: 0.5333333333333333,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "big",
                  name: "big",
                  val: 0.23333333333333334,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "let",
                  name: "let",
                  val: 0.5666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "accommodation",
                  name: "accommodation",
                  val: 0.36666666666666664,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "local",
                  name: "local",
                  val: 0.4666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "run",
                  name: "run",
                  val: 0.5333333333333333,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "challenge",
                  name: "challenge",
                  val: 0.06666666666666667,
                  color: "#ffd700"
                },
                {
                  cluster_id: "5",
                  id: "mean",
                  name: "mean",
                  val: 0.4666666666666667,
                  color: "#ffd700"
                },
                {
                  id: "6",
                  name: "rental, cost, vancouver",
                  val: 460,
                  cluster_id: nil,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "rental",
                  name: "rental",
                  val: 5.2,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "cost",
                  name: "cost",
                  val: 2.6666666666666665,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "vancouver",
                  name: "vancouver",
                  val: 2.8333333333333335,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "year",
                  name: "year",
                  val: 1.8,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "property",
                  name: "property",
                  val: 1.8,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "high",
                  name: "high",
                  val: 1.5666666666666667,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "market",
                  name: "market",
                  val: 1.4,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "rate",
                  name: "rate",
                  val: 1.4,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "community",
                  name: "community",
                  val: 1.3333333333333333,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "long",
                  name: "long",
                  val: 1.0666666666666667,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "taxis",
                  name: "taxis",
                  val: 0.9333333333333333,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "land",
                  name: "land",
                  val: 1.1333333333333333,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "price",
                  name: "price",
                  val: 0.8333333333333334,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "real",
                  name: "real",
                  val: 0.9333333333333333,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "buy",
                  name: "buy",
                  val: 1.1,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "level",
                  name: "level",
                  val: 0.8666666666666667,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "base",
                  name: "base",
                  val: 0.6666666666666666,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "million",
                  name: "million",
                  val: 1.0333333333333334,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "reduce",
                  name: "reduce",
                  val: 0.9666666666666667,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "credit",
                  name: "credit",
                  val: 0.3333333333333333,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "job",
                  name: "job",
                  val: 0.6666666666666666,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "away",
                  name: "away",
                  val: 0.43333333333333335,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "value",
                  name: "value",
                  val: 0.2,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "record",
                  name: "record",
                  val: 0.43333333333333335,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "address",
                  name: "address",
                  val: 0.4666666666666667,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "generate",
                  name: "generate",
                  val: 0.6,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "wait",
                  name: "wait",
                  val: 0.6333333333333333,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "estate",
                  name: "estate",
                  val: 0.7,
                  color: "#8a2be2"
                },
                {
                  cluster_id: "6",
                  id: "rebate",
                  name: "rebate",
                  val: 0.5333333333333333,
                  color: "#8a2be2"
                },
                {
                  id: "7",
                  name: "tenant, term, allow",
                  val: 240,
                  cluster_id: nil,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "tenant",
                  name: "tenant",
                  val: 1.3333333333333333,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "term",
                  name: "term",
                  val: 1.1666666666666667,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "allow",
                  name: "allow",
                  val: 1.4,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "bc",
                  name: "bc",
                  val: 1.2333333333333334,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "landlord",
                  name: "landlord",
                  val: 1.1,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "short",
                  name: "short",
                  val: 0.7666666666666667,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "pod",
                  name: "pod",
                  val: 0.7666666666666667,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "enforce",
                  name: "enforce",
                  val: 0.7666666666666667,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "change",
                  name: "change",
                  val: 0.6666666666666666,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "leave",
                  name: "leave",
                  val: 0.7666666666666667,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "strata",
                  name: "strata",
                  val: 0.6,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "bylaw",
                  name: "bylaw",
                  val: 0.6,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "attract",
                  name: "attract",
                  val: 0.3333333333333333,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "offer",
                  name: "offer",
                  val: 0.7,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "renoviction",
                  name: "renoviction",
                  val: 0.3333333333333333,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "pool",
                  name: "pool",
                  val: 0.13333333333333333,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "limit",
                  name: "limit",
                  val: 0.36666666666666664,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "illegal",
                  name: "illegal",
                  val: 0.43333333333333335,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "double",
                  name: "double",
                  val: 0.5333333333333333,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "apply",
                  name: "apply",
                  val: 0.43333333333333335,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "cover",
                  name: "cover",
                  val: 0.3333333333333333,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "eviction",
                  name: "eviction",
                  val: 0.3,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "car",
                  name: "car",
                  val: 0.1,
                  color: "#ff7373"
                },
                {
                  cluster_id: "7",
                  id: "demolition",
                  name: "demolition",
                  val: 0.13333333333333333,
                  color: "#ff7373"
                },
                {
                  id: "8",
                  name: "owner, time, sell",
                  val: 200,
                  cluster_id: nil,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "owner",
                  name: "owner",
                  val: 1.5,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "time",
                  name: "time",
                  val: 1.3666666666666667,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "sell",
                  name: "sell",
                  val: 1,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "project",
                  name: "project",
                  val: 0.6666666666666666,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "pre",
                  name: "pre",
                  val: 0.7333333333333333,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "want",
                  name: "want",
                  val: 0.8333333333333334,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "right",
                  name: "right",
                  val: 0.6333333333333333,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "loss",
                  name: "loss",
                  val: 0.3333333333333333,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "list",
                  name: "list",
                  val: 0.6333333333333333,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "foreign",
                  name: "foreign",
                  val: 1,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "idea",
                  name: "idea",
                  val: 0.8,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "look",
                  name: "look",
                  val: 0.5,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "federalgovernment",
                  name: "federalgovernment",
                  val: 0.03333333333333333,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "provincial",
                  name: "provincial",
                  val: 0.06666666666666667,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "location",
                  name: "location",
                  val: 0.3333333333333333,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "waiting",
                  name: "waiting",
                  val: 0.4,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "financing",
                  name: "financing",
                  val: 0.06666666666666667,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "party",
                  name: "party",
                  val: 0.16666666666666666,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "test",
                  name: "test",
                  val: 0.6,
                  color: "#00ff00"
                },
                {
                  cluster_id: "8",
                  id: "expense",
                  name: "expense",
                  val: 0.4666666666666667,
                  color: "#00ff00"
                },
                {
                  id: "9",
                  name: "housing, low, live",
                  val: 270,
                  cluster_id: nil,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "housing",
                  name: "housing",
                  val: 5.433333333333334,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "low",
                  name: "low",
                  val: 2.2666666666666666,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "live",
                  name: "live",
                  val: 2.566666666666667,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "support",
                  name: "support",
                  val: 2.1,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "like",
                  name: "like",
                  val: 1.3333333333333333,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "non",
                  name: "non",
                  val: 1.4,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "create",
                  name: "create",
                  val: 1.2666666666666666,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "age",
                  name: "age",
                  val: 0.6333333333333333,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "return",
                  name: "return",
                  val: 0.5333333333333333,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "program",
                  name: "program",
                  val: 0.8,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "share",
                  name: "share",
                  val: 0.7333333333333333,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "access",
                  name: "access",
                  val: 0.5,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "senior",
                  name: "senior",
                  val: 0.6333333333333333,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "student",
                  name: "student",
                  val: 0.43333333333333335,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "op",
                  name: "op",
                  val: 1.0333333333333334,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "government",
                  name: "government",
                  val: 0.5666666666666667,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "option",
                  name: "option",
                  val: 0.5,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "open",
                  name: "open",
                  val: 0.43333333333333335,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "profit",
                  name: "profit",
                  val: 1.1333333333333333,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "system",
                  name: "system",
                  val: 0.2,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "organization",
                  name: "organization",
                  val: 0.5666666666666667,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "zone",
                  name: "zone",
                  val: 0.43333333333333335,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "impact",
                  name: "impact",
                  val: 0.5333333333333333,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "education",
                  name: "education",
                  val: 0.3333333333333333,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "subsidy",
                  name: "subsidy",
                  val: 0.7,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "subsidize",
                  name: "subsidize",
                  val: 0.5666666666666667,
                  color: "#008000"
                },
                {
                  cluster_id: "9",
                  id: "creation",
                  name: "creation",
                  val: 0.26666666666666666,
                  color: "#008000"
                },
                {
                  id: "10",
                  name: "vehicle, solar, recently",
                  val: 130,
                  cluster_id: nil,
                  color: "#0a75ad"
                },
                {
                  cluster_id: "10",
                  id: "vehicle",
                  name: "vehicle",
                  val: 0.13333333333333333,
                  color: "#0a75ad"
                },
                {
                  cluster_id: "10",
                  id: "solar",
                  name: "solar",
                  val: 0.1,
                  color: "#0a75ad"
                },
                {
                  cluster_id: "10",
                  id: "recently",
                  name: "recently",
                  val: 0.06666666666666667,
                  color: "#0a75ad"
                }
              ],
              links: [
                { source: "0", target: "zhang" },
                { source: "0", target: "wei" },
                { source: "0", target: "guang" },
                { source: "0", target: "zhi" },
                { source: "1", target: "people" },
                { source: "1", target: "income" },
                { source: "1", target: "tax" },
                { source: "1", target: "help" },
                { source: "1", target: "money" },
                { source: "1", target: "month" },
                { source: "1", target: "pay" },
                { source: "1", target: "homeless" },
                { source: "1", target: "afford" },
                { source: "1", target: "find" },
                { source: "1", target: "stay" },
                { source: "1", target: "invest" },
                { source: "1", target: "save" },
                { source: "1", target: "person" },
                { source: "1", target: "invancouver" },
                { source: "1", target: "lease" },
                { source: "1", target: "extra" },
                { source: "1", target: "process" },
                { source: "1", target: "charge" },
                { source: "1", target: "debt" },
                { source: "1", target: "develop" },
                { source: "1", target: "homeowner" },
                { source: "1", target: "wish" },
                { source: "1", target: "kid" },
                { source: "1", target: "earn" },
                { source: "1", target: "step" },
                { source: "1", target: "peryear" },
                { source: "1", target: "life" },
                { source: "1", target: "difficult" },
                { source: "1", target: "disability" },
                { source: "2", target: "area" },
                { source: "2", target: "work" },
                { source: "2", target: "space" },
                { source: "2", target: "etc" },
                { source: "2", target: "place" },
                { source: "2", target: "public" },
                { source: "2", target: "way" },
                { source: "2", target: "private" },
                { source: "2", target: "available" },
                { source: "2", target: "currently" },
                { source: "2", target: "social" },
                { source: "2", target: "affordability" },
                { source: "2", target: "individual" },
                { source: "2", target: "care" },
                { source: "2", target: "outside" },
                { source: "2", target: "health" },
                { source: "2", target: "quality" },
                { source: "2", target: "day" },
                { source: "2", target: source },
                { source: "2", target: "volunteer" },
                { source: "2", target: "sector" },
                { source: "2", target: "investment" },
                { source: "2", target: "death" },
                { source: "2", target: "bank" },
                { source: "2", target: "good" },
                { source: "2", target: "hate" },
                { source: "3", target: "home" },
                { source: "3", target: "unit" },
                { source: "3", target: "family" },
                { source: "3", target: "suite" },
                { source: "3", target: "co" },
                { source: "3", target: "exist" },
                { source: "3", target: "permit" },
                { source: "3", target: "include" },
                { source: "3", target: "single" },
                { source: "3", target: "room" },
                { source: "3", target: "facility" },
                { source: "3", target: "lot" },
                { source: "3", target: "living" },
                { source: "3", target: "large" },
                { source: "3", target: "number" },
                { source: "3", target: "secondary" },
                { source: "3", target: "urban" },
                { source: "3", target: "child" },
                { source: "3", target: "add" },
                { source: "3", target: "renovate" },
                { source: "3", target: "funding" },
                { source: "3", target: "upgrade" },
                { source: "3", target: "couple" },
                { source: "3", target: "standard" },
                { source: "3", target: "bridge" },
                { source: "3", target: "come" },
                { source: "3", target: "condition" },
                { source: "3", target: "additional" },
                { source: "3", target: "size" },
                { source: "4", target: "rent" },
                { source: "4", target: "affordable" },
                { source: "4", target: "build" },
                { source: "4", target: "new" },
                { source: "4", target: "building" },
                { source: "4", target: "need" },
                { source: "4", target: "house" },
                { source: "4", target: "increase" },
                { source: "4", target: "developer" },
                { source: "4", target: "require" },
                { source: "4", target: "development" },
                { source: "4", target: "smoke" },
                { source: "4", target: "household" },
                { source: "4", target: "purpose" },
                { source: "4", target: "design" },
                { source: "4", target: "mortgage" },
                { source: "4", target: "purchase" },
                { source: "4", target: "stock" },
                { source: "4", target: "especially" },
                { source: "4", target: "shaughnessy" },
                { source: "4", target: "condo" },
                { source: "4", target: "close" },
                { source: "4", target: "bedroom" },
                { source: "4", target: "apartment" },
                { source: "4", target: "tear" },
                { source: "4", target: "control" },
                { source: "4", target: "supply" },
                { source: "4", target: "actually" },
                { source: "4", target: "certain" },
                { source: "5", target: "city" },
                { source: "5", target: "resident" },
                { source: "5", target: "fund" },
                { source: "5", target: "provide" },
                { source: "5", target: "renter" },
                { source: "5", target: "small" },
                { source: "5", target: "use" },
                { source: "5", target: "service" },
                { source: "5", target: "benefit" },
                { source: "5", target: "revenue" },
                { source: "5", target: "homes" },
                { source: "5", target: "free" },
                { source: "5", target: "loan" },
                { source: "5", target: "future" },
                { source: "5", target: "end" },
                { source: "5", target: "street" },
                { source: "5", target: "temporary" },
                { source: "5", target: "business" },
                { source: "5", target: "current" },
                { source: "5", target: "citizen" },
                { source: "5", target: "tiny" },
                { source: "5", target: "interest" },
                { source: "5", target: "big" },
                { source: "5", target: "let" },
                { source: "5", target: "accommodation" },
                { source: "5", target: "local" },
                { source: "5", target: "run" },
                { source: "5", target: "challenge" },
                { source: "5", target: "mean" },
                { source: "6", target: "rental" },
                { source: "6", target: "cost" },
                { source: "6", target: "vancouver" },
                { source: "6", target: "year" },
                { source: "6", target: "property" },
                { source: "6", target: "high" },
                { source: "6", target: "market" },
                { source: "6", target: "rate" },
                { source: "6", target: "community" },
                { source: "6", target: "long" },
                { source: "6", target: "taxis" },
                { source: "6", target: "land" },
                { source: "6", target: "price" },
                { source: "6", target: "real" },
                { source: "6", target: "buy" },
                { source: "6", target: "level" },
                { source: "6", target: "base" },
                { source: "6", target: "million" },
                { source: "6", target: "reduce" },
                { source: "6", target: "credit" },
                { source: "6", target: "job" },
                { source: "6", target: "away" },
                { source: "6", target: "value" },
                { source: "6", target: "record" },
                { source: "6", target: "address" },
                { source: "6", target: "generate" },
                { source: "6", target: "wait" },
                { source: "6", target: "estate" },
                { source: "6", target: "rebate" },
                { source: "7", target: "tenant" },
                { source: "7", target: "term" },
                { source: "7", target: "allow" },
                { source: "7", target: "bc" },
                { source: "7", target: "landlord" },
                { source: "7", target: "short" },
                { source: "7", target: "pod" },
                { source: "7", target: "enforce" },
                { source: "7", target: "change" },
                { source: "7", target: "leave" },
                { source: "7", target: "strata" },
                { source: "7", target: "bylaw" },
                { source: "7", target: "attract" },
                { source: "7", target: "offer" },
                { source: "7", target: "renoviction" },
                { source: "7", target: "pool" },
                { source: "7", target: "limit" },
                { source: "7", target: "illegal" },
                { source: "7", target: "double" },
                { source: "7", target: "apply" },
                { source: "7", target: "cover" },
                { source: "7", target: "eviction" },
                { source: "7", target: "car" },
                { source: "7", target: "demolition" },
                { source: "8", target: "owner" },
                { source: "8", target: "time" },
                { source: "8", target: "sell" },
                { source: "8", target: "project" },
                { source: "8", target: "pre" },
                { source: "8", target: "want" },
                { source: "8", target: "right" },
                { source: "8", target: "loss" },
                { source: "8", target: "list" },
                { source: "8", target: "foreign" },
                { source: "8", target: "idea" },
                { source: "8", target: "look" },
                { source: "8", target: "federalgovernment" },
                { source: "8", target: "provincial" },
                { source: "8", target: "location" },
                { source: "8", target: "waiting" },
                { source: "8", target: "financing" },
                { source: "8", target: "party" },
                { source: "8", target: "test" },
                { source: "8", target: "expense" },
                { source: "9", target: "housing" },
                { source: "9", target: "low" },
                { source: "9", target: "live" },
                { source: "9", target: "support" },
                { source: "9", target: "like" },
                { source: "9", target: "non" },
                { source: "9", target: "create" },
                { source: "9", target: "age" },
                { source: "9", target: "return" },
                { source: "9", target: "program" },
                { source: "9", target: "share" },
                { source: "9", target: "access" },
                { source: "9", target: "senior" },
                { source: "9", target: "student" },
                { source: "9", target: "op" },
                { source: "9", target: "government" },
                { source: "9", target: "option" },
                { source: "9", target: "open" },
                { source: "9", target: "profit" },
                { source: "9", target: "system" },
                { source: "9", target: "organization" },
                { source: "9", target: "zone" },
                { source: "9", target: "impact" },
                { source: "9", target: "education" },
                { source: "9", target: "subsidy" },
                { source: "9", target: "subsidize" },
                { source: "9", target: "creation" },
                { source: "10", target: "vehicle" },
                { source: "10", target: "solar" },
                { source: "10", target: "recently" },
                { source: "9", target: "10" },
                { source: "1", target: "7" },
                { source: "4", target: "8" },
                { source: "3", target: "9" },
                { source: "5", target: "8" },
                { source: "1", target: "4" },
                { source: "2", target: "6" },
                { source: "2", target: "8" },
                { source: "5", target: "6" },
                { source: "1", target: "2" },
                { source: "1", target: "6" },
                { source: "4", target: "5" },
                { source: "3", target: "6" },
                { source: "4", target: "9" },
                { source: "2", target: "3" },
                { source: "6", target: "7" },
                { source: "2", target: "4" },
                { source: "3", target: "5" },
                { source: "2", target: "7" },
                { source: "4", target: "7" },
                { source: "3", target: "8" },
                { source: "7", target: "8" },
                { source: "7", target: "9" },
                { source: "8", target: "9" },
                { source: "5", target: "9" },
                { source: "1", target: "9" },
                { source: "2", target: "5" },
                { source: "1", target: "5" },
                { source: "3", target: "4" },
                { source: "1", target: "3" },
                { source: "3", target: "7" },
                { source: "1", target: "8" },
                { source: "6", target: "8" },
                { source: "4", target: "6" },
                { source: "5", target: "7" },
                { source: "6", target: "9" },
                { source: "2", target: "9" }
              ]
            }
          }
        }
      end
    end
  end
end

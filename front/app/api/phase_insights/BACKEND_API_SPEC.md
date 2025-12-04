# Phase Insights Backend API Specification

This document specifies the expected API endpoints and response formats for the Phase Insights feature.

## Overview

The Phase Insights feature provides analytics about phase participation, including:

- Participation metrics (visitors, participants, engagement rates, method-specific metrics)
- Demographics (breakdown by user custom fields with representativeness comparison)

## Design Decisions

### Why Series/Options Pattern?

The demographics endpoint uses the **series/options pattern** (same as Report Builder) for:

- ✅ **Consistency** with existing analytics endpoints
- ✅ **Code reuse** - can leverage existing `ReportBuilder::Queries::Demographics`
- ✅ **Future integration** - easier to add to Report Builder later
- ✅ **Established pattern** - familiar to all developers

The frontend handles transformation to component-friendly format.

---

## Endpoint 1: Participation Metrics

### Request

```http
GET /web_api/v1/phases/:phase_id/insights/participation_metrics
```

### Response Format (JSONAPI)

```json
{
  "data": {
    "type": "phase_participation_metrics",
    "id": "phase-uuid",
    "attributes": {
      "visitors": 128442,
      "participants": 2750,
      "engagement_rate": 2.1,
      "visitors_change": 8394,
      "participants_change": 1283,

      // Method-specific metrics (conditional based on participation_method)

      // For ideation/proposals:
      "ideas": 682,
      "comments": 2394,
      "reactions": 18293,
      "ideas_change": 12,
      "comments_change": 192,
      "reactions_change": 8384,

      // For native_survey/survey:
      "submissions": 682,
      "completion_rate": 78.5,
      "submissions_change": 12,

      // For voting/budgeting:
      "votes": 10394,
      "votes_per_person": 3.8,
      "votes_change": 3291,

      // For poll:
      "votes": 842
    }
  }
}
```

### Field Specifications

#### Base Metrics (Always Present)

| Field                 | Type   | Description                                                                     |
| --------------------- | ------ | ------------------------------------------------------------------------------- |
| `visitors`            | number | Unique visitors to the phase                                                    |
| `participants`        | number | Unique participants (users who performed actions)                               |
| `engagement_rate`     | number | Percentage (participants / visitors \* 100), rounded to 1 decimal               |
| `visitors_change`     | number | Change in visitors compared to previous period (last 7 days before phase start) |
| `participants_change` | number | Change in participants compared to previous period                              |

#### Method-Specific Metrics (Conditional)

**Ideation/Proposals:**

- `ideas` (number): Count of published ideas
- `comments` (number): Count of comments on ideas
- `reactions` (number): Count of reactions (likes/dislikes) on ideas
- `*_change` (number): Change for each metric

**Surveys (native_survey/survey):**

- `submissions` (number): Count of submitted survey responses
- `completion_rate` (number): Percentage of surveys completed (0-100), rounded to 1 decimal
- `submissions_change` (number): Change in submissions

**Voting/Budgeting:**

- `votes` (number): Count of submitted baskets
- `votes_per_person` (number): Average votes per participant, rounded to 1 decimal
- `votes_change` (number): Change in votes

**Poll:**

- `votes` (number): Count of poll responses

### Implementation Notes

1. **Visitor Counting**: Use `ImpactTracking::Session` filtered by project pageviews
2. **Participant Counting**: Use `Analytics::FactParticipation` within phase date range
3. **Change Calculations**: Compare current period to equal-length previous period (default: 7 days before phase start)
4. **Ongoing Phases**: Cap end date at `Time.zone.now` for phases still in progress
5. **Method-Specific**: Only include metrics relevant to the phase's participation method

### Suggested Service Structure

```ruby
module PhaseInsights
  class ParticipationMetricsService
    def initialize(phase, compare_period_days: 7)
      @phase = phase
      @start_at = phase.start_at
      @end_at = [phase.end_at, Time.zone.now].compact.min
      @compare_period_days = compare_period_days
    end

    def calculate
      base_metrics.merge(method_specific_metrics)
    end

    private

    def base_metrics
      {
        visitors: visitors_count,
        participants: participants_count,
        engagement_rate: calculate_engagement_rate,
        visitors_change: calculate_change { visitors_count },
        participants_change: calculate_change { participants_count }
      }
    end

    def method_specific_metrics
      case @phase.participation_method
      when 'ideation', 'proposals'
        ideation_metrics
      when 'native_survey', 'survey'
        survey_metrics
      # ... etc
      end
    end
  end
end
```

---

## Endpoint 2: Demographics

### Request

```http
GET /web_api/v1/phases/:phase_id/insights/demographics
```

### Response Format (JSONAPI with Series/Options Pattern)

```json
{
  "data": {
    "type": "phase_demographics",
    "id": "phase-uuid",
    "attributes": {
      "fields": [
        {
          "field_id": "cf-uuid-1",
          "field_key": "gender",
          "field_name_multiloc": {
            "en": "Gender",
            "fr": "Genre",
            "nl": "Geslacht"
          },
          "field_code": "gender",
          "r_score": 45,
          "series": {
            "male": 680,
            "female": 830,
            "non_binary": 45,
            "prefer_not_to_say": 60,
            "_blank": 380
          },
          "options": {
            "male": {
              "title_multiloc": {
                "en": "Male",
                "fr": "Homme",
                "nl": "Man"
              },
              "ordering": 0
            },
            "female": {
              "title_multiloc": {
                "en": "Female",
                "fr": "Femme",
                "nl": "Vrouw"
              },
              "ordering": 1
            },
            "non_binary": {
              "title_multiloc": {
                "en": "Non-binary",
                "fr": "Non-binaire",
                "nl": "Non-binair"
              },
              "ordering": 2
            },
            "prefer_not_to_say": {
              "title_multiloc": {
                "en": "Prefer not to say",
                "fr": "Préfère ne pas dire",
                "nl": "Liever niet zeggen"
              },
              "ordering": 3
            }
          },
          "population_distribution": {
            "male": 1200,
            "female": 1250,
            "non_binary": 50,
            "prefer_not_to_say": 100
          }
        },
        {
          "field_id": "cf-uuid-2",
          "field_key": "birthyear",
          "field_name_multiloc": {
            "en": "Year of birth",
            "fr": "Année de naissance"
          },
          "field_code": "birthyear",
          "r_score": 62,
          "series": {
            "16-24": 165,
            "25-34": 320,
            "35-44": 410,
            "45-54": 380,
            "55-64": 295,
            "65+": 180
          },
          "options": {
            "16-24": {
              "title_multiloc": { "en": "16-24" },
              "ordering": 0
            },
            "25-34": {
              "title_multiloc": { "en": "25-34" },
              "ordering": 1
            }
            // ... etc
          },
          "population_distribution": {
            "16-24": 400,
            "25-34": 500,
            "35-44": 450,
            "45-54": 420,
            "55-64": 380,
            "65+": 250
          }
        }
      ]
    }
  }
}
```

### Field Specifications

#### Top-Level Fields Array

Each field object contains:

| Field                     | Type        | Required | Description                                                                       |
| ------------------------- | ----------- | -------- | --------------------------------------------------------------------------------- |
| `field_id`                | string      | Yes      | Custom field UUID                                                                 |
| `field_key`               | string      | Yes      | Custom field key (e.g., "gender", "education")                                    |
| `field_name_multiloc`     | object      | Yes      | Field name in all locales: `{ "en": "Gender", "fr": "Genre" }`                    |
| `field_code`              | string/null | Yes      | Built-in field code: "gender", "birthyear", "domicile", or null for custom fields |
| `r_score`                 | number/null | No       | Representativeness score 0-100 (multiply existing 0-1 score by 100)               |
| `series`                  | object      | Yes      | Counts by option key: `{ "male": 680, "female": 830, "_blank": 10 }`              |
| `options`                 | object      | No       | Metadata for each option (title_multiloc, ordering). Omit for birthyear fields.   |
| `population_distribution` | object/null | No       | Reference population counts by option key (for representativeness)                |

#### Series Object

- **Keys**: Option keys (e.g., "male", "female", "18-25")
- **Values**: Participant counts (integers)
- **Special key**: `"_blank"` for users who didn't provide this information

#### Options Object

Each option contains:

| Field            | Type   | Description                                                    |
| ---------------- | ------ | -------------------------------------------------------------- |
| `title_multiloc` | object | Option label in all locales: `{ "en": "Male", "fr": "Homme" }` |
| `ordering`       | number | Sort order for display (lower = first)                         |

#### Population Distribution Object (Optional)

- Same structure as `series` but with reference population counts
- Used to calculate representativeness comparison
- Only include if reference distribution data exists for the field

### Special Cases

#### Birthyear Fields

For birthyear fields:

- **Bin into age ranges** (e.g., "16-24", "25-34", "35-44", etc.)
- **Omit `options`** object (or include with simple title_multiloc matching the key)
- Use standard age bins or existing `BinnedDistribution` logic

Example:

```json
{
  "field_code": "birthyear",
  "series": {
    "16-24": 165,
    "25-34": 320
  },
  "options": {
    "16-24": {
      "title_multiloc": { "en": "16-24" },
      "ordering": 0
    }
  }
}
```

#### Anonymous Phases

For phases with `allow_anonymous_participation: true`:

- Return empty fields array: `{ "fields": [] }`
- OR return 403 Forbidden

### Implementation Notes

1. **Field Selection**: Include all enabled user custom fields of type `select` and `number` (birthyear)
2. **Ordering**: Return fields in order: gender, birthyear, domicile, then other custom fields
3. **Participant Scope**: Find participants via `Analytics::FactParticipation` within phase date range
4. **Reuse Existing Logic**: Can leverage `ReportBuilder::Queries::Demographics` and `UserCustomFields::FieldValueCounter`
5. **R-Score**: Use existing `RefDistribution#compute_rscore` if reference distribution exists
6. **Multiloc**: Return all available locales from `title_multiloc`

### Suggested Service Structure

```ruby
module PhaseInsights
  class DemographicsService
    def initialize(phase, current_user)
      @phase = phase
      @current_user = current_user
    end

    def calculate
      {
        fields: enabled_demographic_fields.map do |field|
          build_field_data(field)
        end
      }
    end

    private

    def enabled_demographic_fields
      CustomField
        .where(resource_type: 'User', enabled: true)
        .where(input_type: %w[select number])
        .where("code IN ('gender', 'birthyear', 'domicile') OR code IS NULL")
        .order(custom_ordering_sql)
    end

    def build_field_data(field)
      participants = find_participants
      series = UserCustomFields::FieldValueCounter.counts_by_field_option(participants, field)
      ref_distribution = field.current_ref_distribution

      {
        field_id: field.id,
        field_key: field.key,
        field_name_multiloc: field.title_multiloc,
        field_code: field.code,
        r_score: calculate_r_score(series, ref_distribution),
        series: series,
        options: build_options(field),
        population_distribution: ref_distribution&.distribution
      }
    end

    def find_participants
      user_ids = Analytics::FactParticipation
        .where(dimension_project_id: @phase.project_id)
        .where(dimension_date_created_id: @phase.start_at.to_date..@phase.end_at.to_date)
        .distinct
        .pluck(:dimension_user_id)

      User.where(id: user_ids)
    end
  end
end
```

---

## Authentication & Authorization

Both endpoints require:

- User must be authenticated
- User must have permission to view phase analytics (admin/moderator)
- Use existing Pundit policies: `authorize @phase, :show?`

---

## Error Responses

### 404 Not Found

```json
{
  "errors": [
    {
      "status": 404,
      "code": "not_found",
      "detail": "Phase not found"
    }
  ]
}
```

### 403 Forbidden

```json
{
  "errors": [
    {
      "status": 403,
      "code": "unauthorized",
      "detail": "You are not authorized to view this phase's insights"
    }
  ]
}
```

---

## Testing Checklist

### Participation Metrics

- [ ] Base metrics calculated correctly (visitors, participants, engagement_rate)
- [ ] Change deltas calculated for 7-day comparison period
- [ ] Method-specific metrics only included for relevant participation methods
- [ ] Ongoing phases capped at current time
- [ ] Empty/new phases return zeros (not errors)

### Demographics

- [ ] All enabled select + birthyear fields included
- [ ] Fields ordered correctly (gender, birthyear, domicile, custom)
- [ ] Series counts match participant counts
- [ ] Options include all multiloc locales
- [ ] `_blank` included for missing data
- [ ] R-score calculated when reference distribution exists
- [ ] R-score null when no reference distribution
- [ ] Population distribution included when available
- [ ] Anonymous phases return empty or 403
- [ ] Birthyear fields binned into age ranges

---

## Frontend Transformation

The frontend automatically transforms the series/options format into a simpler data_points array for components:

**Backend format:**

```json
{
  "series": { "male": 680, "female": 830 },
  "options": {
    "male": { "title_multiloc": { "en": "Male" }, "ordering": 0 }
  }
}
```

**Frontend format (after transformation):**

```json
{
  "data_points": [
    { "key": "male", "label": "Male", "count": 680, "percentage": 45.0 },
    { "key": "female", "label": "Female", "count": 830, "percentage": 55.0 }
  ]
}
```

The transformation:

- Calculates percentages (rounded to sum to 100)
- Resolves multiloc to current locale
- Sorts by ordering
- Adds population_percentage if available

---

## Questions?

For questions about the API specification, contact the frontend team or refer to:

- Transformation logic: `/front/app/api/phase_insights/transformDemographics.ts`
- Type definitions: `/front/app/api/phase_insights/types.ts`
- Existing patterns: `ReportBuilder::Queries::Demographics`

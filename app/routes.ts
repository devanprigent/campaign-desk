import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/opportunities.tsx"),
  route("opportunities/:opportunityId", "routes/opportunity.tsx"),
] satisfies RouteConfig;

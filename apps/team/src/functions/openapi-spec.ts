import { getOpenAPISpecFunction, openAPISpecEvent } from "@team-tasks/utils";
import { type Document } from "openapi-backend";

import { openApiSpec } from "../openapi/index.ts";

export const event = openAPISpecEvent;

export default getOpenAPISpecFunction(openApiSpec as Document);

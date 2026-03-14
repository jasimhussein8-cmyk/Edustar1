import serverless from "serverless-http";
import { createServer } from "../../server";

let serverlessApp: any;

export const handler = async (event: any, context: any) => {
  if (!serverlessApp) {
    const app = await createServer();
    serverlessApp = serverless(app);
  }
  return serverlessApp(event, context);
};

// api/index.js
// Vercel Serverless Function entry point — wraps Express app

import { createApp } from "../backend/lib/express.js";

const app = createApp();

export default app;

import { json, type RequestHandler } from '@buildxn/http';

const handler: RequestHandler = () => {
  return json({
    message: 'Hello from bxn!',
    timestamp: new Date().toISOString(),
  });
};

export default handler;

import { json, badRequest, notFound, type RequestHandler, type Ok, type BadRequest, type NotFound } from '@buildxn/http';
import { db, type Author } from '../../../db.ts';

type Params = { authorId?: string };

// Define all possible response types as a union
type Response = Ok<Author> | BadRequest<{error: string}> | NotFound<{error: string}>;

// GET /authors/:authorId - Get author details
const handler: RequestHandler<Params, Response> = (req): Response => {
    const { authorId } = req.params;

    if (!authorId) {
        return badRequest({error: 'Author ID is required'});
    }

    const author = db.authors.get(authorId);
    if (!author) {
        return notFound({error: 'Author not found'});
    }

    return json(author);
};

export default handler;

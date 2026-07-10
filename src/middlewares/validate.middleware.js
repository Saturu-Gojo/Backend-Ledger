const ApiError = require('../utils/ApiError');

// Usage: router.post('/transfer', validate(transferSchema), handler)
// schema should be a Zod object shaped like { body: z.object({...}), params: z.object({...}) }
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return next(ApiError.badRequest('Invalid request data', details));
  }

  // Use parsed/coerced values downstream
  req.body = result.data.body ?? req.body;
  req.params = result.data.params ?? req.params;
  req.query = result.data.query ?? req.query;
  next();
};

module.exports = validate;

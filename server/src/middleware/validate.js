export function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = parsed.error.flatten();
      error.issues = parsed.error.issues.map(({ path, message }) => ({
        field: path[0] === "body" ? path.slice(1).join(".") : path.join("."),
        message
      }));
      next(error);
      return;
    }

    req.validated = parsed.data;
    next();
  };
}

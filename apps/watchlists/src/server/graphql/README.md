GraphQL Yoga schema, resolvers, and context creation live here.

Resolvers compose backend services such as `server/services/markets/service` instead
of importing upstream query documents directly, keeping the public app API
separate from Morpho's schema.

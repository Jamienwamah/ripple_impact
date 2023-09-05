const { ApolloServer, gql } = require('apollo-server-express');
const authenticateToken = require('./authMiddleware');

const typeDefs = gql`
  type Query {
    protectedData: String
  }
`;

const resolvers = {
  Query: {
    protectedData: (parent, args, context) => {
      if (!context.user) {
        throw new Error('Unauthorized'); // Reject unauthenticated requests
      }
      return 'This data is protected!';
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    user: req.user, // Attach user data to the context
  }),
});

// Apply the authentication middleware to GraphQL endpoint
app.use('/graphql', authenticateToken);
server.applyMiddleware({ app });

// ... other middleware and routes

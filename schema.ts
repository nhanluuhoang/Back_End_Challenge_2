export const typeDefs = `#graphql
  type Query {
    # Public queries
    news(
      search: String
      categoryId: String
      publisherId: String
      published: Boolean
      page: Int = 1
      limit: Int = 10
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): NewsConnection!
    
    newsDetail(id: String, slug: String): News
    categories: [Category!]!
    publishers: [Publisher!]!
    
    # Publisher queries (authenticated)
    myNews(
      page: Int = 1
      limit: Int = 10
      published: Boolean
    ): NewsConnection!
    
    me: Publisher
  }

  type Mutation {
    # Authentication
    publisherLogin(email: String!, password: String!): AuthPayload!
    publisherRegister(input: PublisherRegisterInput!): AuthPayload!
    
    # News management (authenticated publishers only)
    createNews(input: CreateNewsInput!): News!
    updateNews(id: String!, input: UpdateNewsInput!): News!
    deleteNews(id: String!): DeleteResponse!
    
    # Webhook management
    updateWebhook(webhookUrl: String!): Publisher!
  }

  input PublisherRegisterInput {
    email: String!
    password: String!
    name: String!
    description: String
    webhookUrl: String
  }

  input CreateNewsInput {
    title: String!
    content: String!
    excerpt: String
    imageUrl: String
    categoryId: String!
    published: Boolean = false
  }

  input UpdateNewsInput {
    title: String
    content: String
    excerpt: String
    imageUrl: String
    categoryId: String
    published: Boolean
  }

  type AuthPayload {
    token: String!
    publisher: Publisher!
  }

  type Publisher {
    id: ID!
    email: String!
    name: String!
    description: String
    webhookUrl: String
    createdAt: String!
    updatedAt: String!
    newsCount: Int!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    newsCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type News {
    id: ID!
    title: String!
    slug: String!
    content: String!
    excerpt: String
    imageUrl: String
    published: Boolean!
    viewCount: Int!
    createdAt: String!
    updatedAt: String!
    publisher: Publisher!
    category: Category!
  }

  type NewsConnection {
    nodes: [News!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }
`;
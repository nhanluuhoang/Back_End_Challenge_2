# News API - GraphQL Implementation

A production-ready GraphQL API for a news publishing platform built with TypeScript, Apollo Server, and Prisma.

## 🚀 Features

- **Public API**: Anyone can browse news, categories, and publishers
- **Publisher Authentication**: JWT-based authentication for publishers
- **News Management**: Publishers can create, update, and delete their own news
- **Advanced Search**: Search, filter, and paginate news articles
- **Webhooks**: Real-time notifications when news is viewed
- **Type Safety**: Full TypeScript with strict mode enabled
- **Testing**: Comprehensive unit tests with Jest
- **Database**: PostgreSQL with Prisma ORM

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🛠️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd news-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up the database
```bash
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
```

5. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:4000/graphql`

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📚 API Documentation

### Public Queries

#### Get News List
```graphql
query {
  news(
    search: "technology"
    categoryId: "category-uuid"
    page: 1
    limit: 10
    published: true
  ) {
    nodes {
      id
      title
      slug
      excerpt
      viewCount
      publisher {
        name
      }
      category {
        name
      }
    }
    totalCount
    pageInfo {
      currentPage
      totalPages
      hasNextPage
    }
  }
}
```

#### Get News Detail
```graphql
query {
  newsDetail(slug: "ai-revolution-2025") {
    id
    title
    content
    imageUrl
    viewCount
    publisher {
      name
      description
    }
    category {
      name
    }
  }
}
```

#### Get Categories
```graphql
query {
  categories {
    id
    name
    slug
    newsCount
  }
}
```

### Authentication

#### Register Publisher
```graphql
mutation {
  publisherRegister(
    input: {
      email: "publisher@example.com"
      password: "securepassword"
      name: "My Publishing House"
      description: "We publish great content"
      webhookUrl: "https://mysite.com/webhook"
    }
  ) {
    token
    publisher {
      id
      name
      email
    }
  }
}
```

#### Login
```graphql
mutation {
  publisherLogin(
    email: "publisher@example.com"
    password: "securepassword"
  ) {
    token
    publisher {
      id
      name
    }
  }
}
```

### Authenticated Mutations

Add the JWT token to your headers:
```
Authorization: Bearer <your-jwt-token>
```

#### Create News
```graphql
mutation {
  createNews(
    input: {
      title: "Breaking: New Technology Discovered"
      content: "Full article content here..."
      excerpt: "Short summary"
      imageUrl: "https://example.com/image.jpg"
      categoryId: "category-uuid"
      published: true
    }
  ) {
    id
    title
    slug
    published
  }
}
```

#### Update News
```graphql
mutation {
  updateNews(
    id: "news-uuid"
    input: {
      title: "Updated Title"
      published: true
    }
  ) {
    id
    title
    updatedAt
  }
}
```

#### Delete News
```graphql
mutation {
  deleteNews(id: "news-uuid") {
    success
    message
  }
}
```

## 🔔 Webhook Notifications

When a news article is viewed, the system sends a POST request to the publisher's registered webhook URL:

```json
{
  "event": "news.viewed",
  "timestamp": "2025-11-19T10:30:00.000Z",
  "data": {
    "newsId": "uuid",
    "newsTitle": "Article Title",
    "viewCount": 42
  }
}
```

## 🏗️ Project Structure

```
src/
├── __tests__/          # Unit tests
├── types/              # TypeScript type definitions
├── resolvers/          # GraphQL resolvers
├── utils/              # Utility functions
├── schema.ts           # GraphQL schema
├── context.ts          # Apollo context
└── index.ts            # Server entry point
```

## 🚢 Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm run prisma:generate
EXPOSE 4000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t news-api .
docker run -p 4000:4000 news-api
```

## 🔒 Security Features

- JWT authentication with 7-day expiration
- Password hashing with bcrypt
- Input validation with Zod
- SQL injection protection via Prisma
- Authorization checks on mutations

## 📊 Database Schema

- **Publishers**: User accounts for news publishers
- **Categories**: News categories (Technology, Business, etc.)
- **News**: News articles with full content and metadata

## 🧰 Technologies Used

- **Apollo Server 4**: GraphQL server
- **Prisma**: Modern ORM for TypeScript
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Zod**: Runtime validation
- **Jest**: Testing framework
- **TypeScript**: Type-safe development

## 📝 Test Credentials

After running the seed script:
- Email: `techpub@example.com`
- Email: `newscorp@example.com`
- Password: `password123`

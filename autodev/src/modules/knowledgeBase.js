/**
 * knowledgeBase.js
 * Knowledge base system for the AutoDev agent with domain-specific knowledge about the hospitality industry
 */

import { PineconeClient } from '@pinecone-database/pinecone';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Knowledge base system for the AutoDev agent
 */
export class KnowledgeBase {
  /**
   * Create a new KnowledgeBase instance
   * @param {Object} options - KnowledgeBase options
   * @param {Object} options.agent - AutoDev agent instance
   * @param {Object} options.config - Configuration object
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.events - Event emitter instance
   */
  constructor(options) {
    this.agent = options.agent;
    this.config = options.config;
    this.logger = options.logger;
    this.events = options.events;
    this.pineconeClient = null;
    this.vectorStore = null;
    this.embeddings = null;
    this.initialized = false;
    this.knowledgeDir = path.join(__dirname, '../../knowledge');
  }

  /**
   * Initialize the knowledge base
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.logger.info('Initializing knowledge base...');
      
      // Initialize Pinecone client
      this.pineconeClient = new PineconeClient();
      await this.pineconeClient.init({
        apiKey: this.config.knowledgeBase.pinecone.apiKey,
        environment: this.config.knowledgeBase.pinecone.environment,
      });
      
      // Initialize OpenAI embeddings
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: this.config.knowledgeBase.openai.apiKey,
        modelName: this.config.knowledgeBase.openai.embeddingModel || 'text-embedding-3-small',
      });
      
      // Get or create index
      const indexName = this.config.knowledgeBase.pinecone.indexName;
      const indexes = await this.pineconeClient.listIndexes();
      
      if (!indexes.includes(indexName)) {
        this.logger.info(`Creating Pinecone index: ${indexName}`);
        await this.pineconeClient.createIndex({
          name: indexName,
          dimension: 1536, // Dimension for OpenAI embeddings
          metric: 'cosine',
        });
        
        // Wait for index to be ready
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
      
      // Connect to index
      const index = this.pineconeClient.Index(indexName);
      
      // Initialize vector store
      this.vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        { pineconeIndex: index, namespace: 'hospitality' }
      );
      
      this.initialized = true;
      this.logger.info('Knowledge base initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize knowledge base: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Ensure the knowledge base is initialized
   * @returns {Promise<void>}
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Ingest documents into the knowledge base
   * @param {Array<Object>} documents - Array of document objects with text and metadata
   * @returns {Promise<Object>} Ingestion results
   */
  async ingestDocuments(documents) {
    await this.ensureInitialized();
    
    try {
      this.logger.info(`Ingesting ${documents.length} documents into knowledge base...`);
      
      // Process documents
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const docs = [];
      
      for (const doc of documents) {
        const splits = await textSplitter.splitText(doc.text);
        
        for (const [i, text] of splits.entries()) {
          docs.push(
            new Document({
              pageContent: text,
              metadata: {
                ...doc.metadata,
                chunk: i,
                totalChunks: splits.length,
              },
            })
          );
        }
      }
      
      // Add documents to vector store
      await this.vectorStore.addDocuments(docs);
      
      this.logger.info(`Successfully ingested ${docs.length} document chunks`);
      
      return {
        success: true,
        documentsIngested: documents.length,
        chunksIngested: docs.length,
      };
    } catch (error) {
      this.logger.error(`Document ingestion failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Ingest documents from files
   * @param {Object} options - Ingestion options
   * @param {string} options.directory - Directory containing documents
   * @param {string} options.pattern - Glob pattern for files
   * @param {string} options.category - Category for the documents
   * @returns {Promise<Object>} Ingestion results
   */
  async ingestFromFiles(options) {
    const { directory, pattern = '**/*.{md,txt,json}', category } = options;
    
    try {
      // Find all matching files
      const files = await glob(pattern, {
        cwd: directory,
        absolute: false,
      });
      
      if (files.length === 0) {
        this.logger.warn(`No files found matching pattern: ${pattern} in directory: ${directory}`);
        return {
          success: true,
          documentsIngested: 0,
          chunksIngested: 0,
        };
      }
      
      // Read and process each file
      const documents = [];
      
      for (const file of files) {
        const filePath = path.join(directory, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        documents.push({
          text: content,
          metadata: {
            source: filePath,
            category,
            filename: file,
            type: path.extname(file).substring(1),
          },
        });
      }
      
      // Ingest documents
      return await this.ingestDocuments(documents);
    } catch (error) {
      this.logger.error(`File ingestion failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Ingest documents from a URL
   * @param {Object} options - Ingestion options
   * @param {string} options.url - URL to fetch
   * @param {string} options.category - Category for the document
   * @returns {Promise<Object>} Ingestion results
   */
  async ingestFromUrl(options) {
    const { url, category } = options;
    
    try {
      // Fetch content from URL
      const response = await axios.get(url);
      const content = response.data;
      
      // Convert to string if necessary
      const text = typeof content === 'string' 
        ? content 
        : JSON.stringify(content, null, 2);
      
      // Create document
      const document = {
        text,
        metadata: {
          source: url,
          category,
          type: 'url',
        },
      };
      
      // Ingest document
      return await this.ingestDocuments([document]);
    } catch (error) {
      this.logger.error(`URL ingestion failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Query the knowledge base
   * @param {Object} options - Query options
   * @param {string} options.query - Query text
   * @param {number} options.limit - Maximum number of results
   * @param {Array<string>} options.categories - Categories to filter by
   * @returns {Promise<Array<Object>>} Query results
   */
  async query(options) {
    await this.ensureInitialized();
    
    const { query, limit = 5, categories = [] } = options;
    
    try {
      this.logger.info(`Querying knowledge base: ${query}`);
      
      // Create filter if categories are specified
      const filter = categories.length > 0 
        ? { category: { $in: categories } }
        : undefined;
      
      // Query vector store
      const results = await this.vectorStore.similaritySearch(
        query,
        limit,
        filter
      );
      
      return results.map(result => ({
        content: result.pageContent,
        metadata: result.metadata,
        score: result.score,
      }));
    } catch (error) {
      this.logger.error(`Knowledge base query failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Enhance a prompt with relevant knowledge
   * @param {Object} options - Enhancement options
   * @param {string} options.prompt - Original prompt
   * @param {number} options.limit - Maximum number of knowledge items to include
   * @param {Array<string>} options.categories - Categories to filter by
   * @returns {Promise<string>} Enhanced prompt
   */
  async enhancePrompt(options) {
    const { prompt, limit = 3, categories = [] } = options;
    
    try {
      // Query knowledge base for relevant information
      const results = await this.query({
        query: prompt,
        limit,
        categories,
      });
      
      if (results.length === 0) {
        return prompt;
      }
      
      // Format knowledge for inclusion in prompt
      const knowledgeSection = results.map((result, index) => {
        return `[Knowledge Item ${index + 1}] Source: ${result.metadata.source || 'Unknown'}\n${result.content}`;
      }).join('\n\n');
      
      // Enhance prompt with knowledge
      const enhancedPrompt = `
I need to respond to the following prompt, and I have some relevant knowledge from the hospitality industry that might help:

RELEVANT KNOWLEDGE:
${knowledgeSection}

ORIGINAL PROMPT:
${prompt}

Please use the relevant knowledge above to inform your response to the original prompt. Incorporate domain-specific insights where appropriate.
`;
      
      return enhancedPrompt;
    } catch (error) {
      this.logger.error(`Prompt enhancement failed: ${error.message}`, error);
      // Fall back to original prompt
      return prompt;
    }
  }

  /**
   * Load the initial dataset into the knowledge base
   * @returns {Promise<Object>} Loading results
   */
  async loadInitialDataset() {
    try {
      this.logger.info('Loading initial hospitality industry dataset...');
      
      // Ensure knowledge directory exists
      await fs.mkdir(this.knowledgeDir, { recursive: true });
      
      // Define categories and their directories
      const categories = [
        'restaurant_management',
        'pos_integration',
        'reservation_systems',
        'inventory_procurement',
        'payment_processing',
        'supplier_relations',
      ];
      
      // Create category directories if they don't exist
      for (const category of categories) {
        const categoryDir = path.join(this.knowledgeDir, category);
        await fs.mkdir(categoryDir, { recursive: true });
      }
      
      // Check if initial dataset has already been created
      const datasetMarker = path.join(this.knowledgeDir, '.initial_dataset_loaded');
      try {
        await fs.access(datasetMarker);
        this.logger.info('Initial dataset already loaded, skipping...');
        return { success: true, alreadyLoaded: true };
      } catch (error) {
        // File doesn't exist, continue with loading
      }
      
      // Create initial dataset files
      await this.createInitialDatasetFiles();
      
      // Ingest each category
      let totalDocuments = 0;
      let totalChunks = 0;
      
      for (const category of categories) {
        const result = await this.ingestFromFiles({
          directory: path.join(this.knowledgeDir, category),
          pattern: '*.md',
          category,
        });
        
        totalDocuments += result.documentsIngested;
        totalChunks += result.chunksIngested;
      }
      
      // Mark initial dataset as loaded
      await fs.writeFile(datasetMarker, new Date().toISOString());
      
      this.logger.info(`Initial dataset loaded: ${totalDocuments} documents, ${totalChunks} chunks`);
      
      return {
        success: true,
        documentsIngested: totalDocuments,
        chunksIngested: totalChunks,
      };
    } catch (error) {
      this.logger.error(`Failed to load initial dataset: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Create initial dataset files
   * @returns {Promise<void>}
   */
  async createInitialDatasetFiles() {
    // Restaurant Management Systems
    await fs.writeFile(
      path.join(this.knowledgeDir, 'restaurant_management', 'overview.md'),
      `# Restaurant Management Systems Overview

Restaurant Management Systems (RMS) are comprehensive software solutions designed to streamline operations in food service establishments. These systems integrate various aspects of restaurant management, from front-of-house operations to back-office administration.

## Key Components

1. **Point of Sale (POS) System**: The core component that processes transactions, manages orders, and tracks sales.
2. **Inventory Management**: Tracks stock levels, monitors usage, and automates reordering.
3. **Staff Management**: Handles scheduling, time tracking, and performance monitoring.
4. **Reservation System**: Manages table bookings and optimizes seating arrangements.
5. **Customer Relationship Management (CRM)**: Stores customer data and preferences to enhance service and marketing.
6. **Reporting and Analytics**: Provides insights into sales, costs, and operational efficiency.

## Benefits

- **Operational Efficiency**: Automates routine tasks and streamlines workflows.
- **Cost Control**: Monitors food costs, labor expenses, and other operational costs.
- **Enhanced Customer Experience**: Speeds up service and ensures order accuracy.
- **Data-Driven Decision Making**: Provides actionable insights through comprehensive reporting.
- **Scalability**: Supports business growth with flexible configurations.

## Implementation Considerations

- **Integration Capabilities**: Must seamlessly connect with existing systems and third-party services.
- **User-Friendly Interface**: Should be intuitive for staff with varying technical skills.
- **Mobile Accessibility**: Mobile apps or responsive design for on-the-go management.
- **Customization Options**: Ability to adapt to specific business needs and workflows.
- **Support and Training**: Vendor should provide comprehensive training and ongoing support.

## Popular RMS Providers

- **Toast**: Cloud-based system with strong hardware integration.
- **Lightspeed Restaurant**: Feature-rich solution with excellent inventory management.
- **Square for Restaurants**: User-friendly system with integrated payment processing.
- **TouchBistro**: iPad-based POS designed specifically for restaurants.
- **Upserve**: Comprehensive platform with strong analytics capabilities.`
    );

    await fs.writeFile(
      path.join(this.knowledgeDir, 'restaurant_management', 'implementation_best_practices.md'),
      `# Restaurant Management System Implementation Best Practices

Implementing a Restaurant Management System (RMS) requires careful planning and execution to ensure successful adoption and maximum benefit for your food service establishment.

## Pre-Implementation Planning

1. **Define Clear Objectives**
   - Identify specific pain points in current operations
   - Set measurable goals for the new system (e.g., reduce order errors by 50%)
   - Prioritize features based on business impact

2. **Stakeholder Involvement**
   - Include representatives from all departments (kitchen, service, management)
   - Gather input on workflow requirements and pain points
   - Identify system champions who will help drive adoption

3. **System Selection Criteria**
   - Scalability to accommodate business growth
   - Integration capabilities with existing systems
   - Total cost of ownership (including hardware, training, support)
   - Vendor reputation and support quality
   - Security features and compliance with regulations

## Implementation Process

1. **Data Migration Planning**
   - Inventory items and recipes
   - Customer information and loyalty program data
   - Historical sales data for reporting continuity
   - Menu structure and pricing

2. **Hardware Setup**
   - POS terminals with appropriate specifications
   - Kitchen display systems
   - Receipt printers and cash drawers
   - Networking infrastructure with redundancy
   - Secure payment processing devices

3. **Phased Rollout Approach**
   - Start with core POS functionality
   - Add inventory management once POS is stable
   - Implement advanced features after core functions are mastered
   - Consider piloting in one location before full deployment

4. **Staff Training Program**
   - Role-specific training sessions
   - Hands-on practice in test environment
   - Create quick reference guides for common tasks
   - Designate super-users who can provide peer support

## Post-Implementation Best Practices

1. **Continuous Monitoring and Optimization**
   - Regular review of system performance metrics
   - Soliciting staff feedback on usability issues
   - Identifying bottlenecks in workflows
   - Adjusting configurations to improve efficiency

2. **Data Analysis and Utilization**
   - Establish regular reporting schedule
   - Train managers on data interpretation
   - Use insights to inform menu engineering
   - Track KPIs against pre-implementation benchmarks

3. **Maintenance and Updates**
   - Establish update schedule during off-peak hours
   - Test updates in non-production environment first
   - Maintain backup procedures for critical data
   - Document all customizations and configurations

4. **Ongoing Training**
   - Refresher sessions for existing staff
   - Comprehensive training for new hires
   - Updates when new features are implemented
   - Advanced training for power users

## Common Pitfalls to Avoid

- **Inadequate Training**: Rushing training leads to poor adoption and underutilization
- **Skipping Testing**: Failing to thoroughly test all functions in your specific environment
- **Poor Data Migration**: Inaccurate or incomplete data transfer causing operational issues
- **Ignoring Integration Needs**: Not considering how the RMS will work with other business systems
- **Resistance Management**: Failing to address staff concerns and resistance to change`
    );

    // POS Integrations
    await fs.writeFile(
      path.join(this.knowledgeDir, 'pos_integration', 'integration_patterns.md'),
      `# POS Integration Patterns for Restaurant Software

Point of Sale (POS) systems serve as the central hub for restaurant operations. Effective integration with these systems is crucial for any restaurant software solution. This document outlines common integration patterns, protocols, and best practices.

## Integration Approaches

### 1. Direct API Integration

Direct API integration involves connecting directly to the POS system's API endpoints.

**Advantages:**
- Real-time data exchange
- Complete access to POS functionality
- Reduced middleware complexity

**Considerations:**
- Requires POS vendor API access (may involve partnership agreements)
- API changes require updates to integration code
- Different implementation for each POS system

**Common Implementation Pattern:**
\`\`\`javascript
// Example of direct API integration with a POS system
async function sendOrderToPOS(order) {
  try {
    const posApiEndpoint = config.posSystem.apiEndpoint + '/orders';
    const posApiKey = config.posSystem.apiKey;
    
    const response = await axios.post(posApiEndpoint, order, {
      headers: {
        'Authorization': \`Bearer \${posApiKey}\`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      posOrderId: response.data.orderId,
      timestamp: response.data.timestamp
    };
  } catch (error) {
    logger.error('POS integration error:', error);
    throw new Error('Failed to send order to POS system');
  }
}
\`\`\`

### 2. Middleware Integration

Using middleware or an integration platform to connect with multiple POS systems through a unified interface.

**Advantages:**
- Single integration point for multiple POS systems
- Abstraction layer isolates from POS-specific changes
- Often provides additional data transformation capabilities

**Considerations:**
- Additional cost for middleware solution
- Potential latency in data synchronization
- Dependency on third-party middleware vendor

**Popular Middleware Solutions:**
- ItsaCheckmate
- Omnivore
- Chowly
- Deliverect
- Olo

### 3. Database-Level Integration

Direct database integration involves reading from or writing to the POS system's database.

**Advantages:**
- Access to all data without API limitations
- Can be implemented without vendor cooperation
- Often faster for bulk data operations

**Considerations:**
- Highly discouraged by most POS vendors
- May violate terms of service
- High risk of breaking with POS updates
- No validation rules enforced by application logic

### 4. Webhook-Based Integration

Using webhooks to receive real-time notifications of events from the POS system.

**Advantages:**
- Real-time updates
- Reduced polling overhead
- Event-driven architecture

**Considerations:**
- Requires POS system to support webhooks
- Need to handle webhook security (validation, replay protection)
- Must maintain endpoint availability

**Example Webhook Handler:**
\`\`\`javascript
// Example webhook handler for POS events
app.post('/api/pos-webhooks', async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-pos-signature'];
    const isValid = verifyWebhookSignature(signature, req.body, webhookSecret);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    
    const eventType = req.body.eventType;
    
    // Process different event types
    switch (eventType) {
      case 'order.created':
        await processNewOrder(req.body.data);
        break;
      case 'order.updated':
        await processOrderUpdate(req.body.data);
        break;
      case 'menu.updated':
        await refreshMenuCache(req.body.data);
        break;
      default:
        logger.info('Unhandled POS event type:', eventType);
    }
    
    // Acknowledge receipt of webhook
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error processing POS webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
\`\`\`

## Common Integration Points

1. **Menu Synchronization**
   - Categories, items, modifiers, and pricing
   - Availability and 86'd items
   - Special and seasonal offerings

2. **Order Management**
   - Order creation and submission
   - Order status updates
   - Modification and cancellation

3. **Payment Processing**
   - Payment authorization
   - Capture and settlement
   - Refunds and adjustments

4. **Customer Data**
   - Profile information
   - Order history
   - Loyalty program integration

5. **Reporting and Analytics**
   - Sales data
   - Product mix
   - Labor and cost metrics

## Data Synchronization Strategies

1. **Real-time Synchronization**
   - Immediate updates via API calls or webhooks
   - Ensures data consistency across systems
   - Higher implementation complexity and resource usage

2. **Batch Synchronization**
   - Periodic updates at scheduled intervals
   - More efficient for large data sets
   - Acceptable for non-critical data (e.g., historical reporting)

3. **Hybrid Approach**
   - Real-time for critical operations (orders, payments)
   - Batch for less time-sensitive data (menu updates, reporting)

## Error Handling and Resilience

1. **Retry Mechanisms**
   - Implement exponential backoff for failed requests
   - Set maximum retry attempts
   - Log detailed error information

2. **Queueing Systems**
   - Use message queues for asynchronous processing
   - Ensure persistence of failed operations
   - Process queue items when systems recover

3. **Fallback Procedures**
   - Define manual processes when integration fails
   - Provide clear error messages to users
   - Implement circuit breakers to prevent cascade failures

## Security Considerations

1. **Authentication**
   - Use OAuth 2.0 or API keys with proper rotation
   - Implement IP whitelisting where possible
   - Never expose credentials in client-side code

2. **Data Protection**
   - Encrypt sensitive data in transit and at rest
   - Minimize storage of PCI data
   - Implement proper access controls

3. **Audit Logging**
   - Log all integration activities
   - Include timestamps, user information, and actions
   - Establish monitoring for suspicious patterns`
    );

    // Reservation Systems
    await fs.writeFile(
      path.join(this.knowledgeDir, 'reservation_systems', 'api_integration.md'),
      `# Reservation System API Integration Guide

This guide provides detailed information on integrating with popular restaurant reservation systems through their APIs. Understanding these integration patterns is essential for developing software that interacts with reservation platforms.

## Common Reservation System APIs

### OpenTable API

OpenTable provides a REST API that allows partners to access restaurant information and manage reservations.

**Authentication:**
- OAuth 2.0 client credentials flow
- API keys for read-only access

**Key Endpoints:**
- \`/restaurants\` - Restaurant information and availability
- \`/reservations\` - Create and manage reservations
- \`/availability\` - Check table availability

**Rate Limits:**
- 100 requests per minute for standard partners
- 1000 requests per minute for premium partners

**Example Request:**
\`\`\`javascript
// Example: Checking availability on OpenTable
async function checkOpenTableAvailability(restaurantId, partySize, date) {
  try {
    const response = await axios.get('https://api.opentable.com/v1/availability', {
      params: {
        restaurant_id: restaurantId,
        party_size: partySize,
        date_time: date.toISOString()
      },
      headers: {
        'Authorization': \`Bearer \${openTableApiToken}\`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.available_slots;
  } catch (error) {
    logger.error('OpenTable API error:', error);
    throw new Error('Failed to check availability');
  }
}
\`\`\`

### Resy API

Resy offers a comprehensive API for restaurant reservations and venue information.

**Authentication:**
- API key in request header
- JWT tokens for authenticated user actions

**Key Endpoints:**
- \`/venues\` - Restaurant venue information
- \`/reservations\` - Reservation management
- \`/availability\` - Slot availability search

**Webhook Support:**
- Reservation created/modified/canceled events
- Venue information updates

**Example Integration:**
\`\`\`javascript
// Example: Creating a reservation on Resy
async function createResyReservation(venueId, userId, partySize, date, slotToken) {
  try {
    const response = await axios.post('https://api.resy.com/3/reservations', {
      venue_id: venueId,
      user_id: userId,
      party_size: partySize,
      date: date.toISOString().split('T')[0],
      slot_token: slotToken
    }, {
      headers: {
        'Authorization': \`ResyAPI api_key="\${resyApiKey}"\`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      reservation_id: response.data.reservation_id,
      confirmation_code: response.data.confirmation_code
    };
  } catch (error) {
    logger.error('Resy API error:', error);
    throw new Error('Failed to create reservation');
  }
}
\`\`\`

### SevenRooms API

SevenRooms provides an API for venue management, reservations, and guest profiles.

**Authentication:**
- OAuth 2.0 with client credentials
- Refresh token flow for extended access

**Key Endpoints:**
- \`/venues\` - Venue information and settings
- \`/reservations\` - Reservation CRUD operations
- \`/guests\` - Guest profile management
- \`/availability/search\` - Find available reservation slots

**Data Synchronization:**
- Webhooks for real-time updates
- Bulk export API for data migration

## Integration Patterns

### 1. Direct Booking Integration

Allows your application to create reservations directly in the reservation system.

**Implementation Steps:**
1. Authenticate with the reservation system API
2. Search for availability using venue ID, date, and party size
3. Present available time slots to the user
4. Collect user information (name, email, phone, special requests)
5. Create reservation using selected time slot
6. Handle confirmation and send details to user

**Error Handling:**
- Implement retry logic for transient errors
- Handle reservation conflicts gracefully
- Provide clear error messages for user-fixable issues

### 2. Availability Widget Integration

Embeds the reservation system's availability widget in your application.

**Advantages:**
- Simpler implementation
- Maintained by the reservation platform
- Consistent with direct booking experience

**Implementation:**
\`\`\`javascript
// Example: Embedding OpenTable widget
function renderOpenTableWidget(restaurantId, theme = 'standard') {
  return \`
    <script type='text/javascript' src='//www.opentable.com/widget/reservation/loader?rid=\${restaurantId}&type=standard&theme=\${theme}&iframe=true&domain=com&lang=en-US&newtab=false&ot_source=Restaurant%20website'></script>
  \`;
}
\`\`\`

### 3. Two-Way Synchronization

Maintains reservation data in both your system and the reservation platform.

**Use Cases:**
- Custom CRM integration
- Advanced reporting and analytics
- Multi-platform reservation management

**Synchronization Strategy:**
1. Use webhooks to receive real-time updates
2. Implement periodic reconciliation to catch missed events
3. Establish clear conflict resolution rules
4. Maintain audit logs of all synchronization activities

## Guest Data Management

### 1. Profile Unification

Techniques for matching guest profiles across systems:

- Email address as primary identifier
- Phone number normalization and matching
- Name fuzzy matching algorithms
- Address standardization and comparison

### 2. Privacy Compliance

Requirements for handling reservation guest data:

- GDPR compliance for European guests
- CCPA compliance for California residents
- Explicit consent for marketing communications
- Data retention policies and purging mechanisms
- Data portability support

### 3. Guest Preference Handling

Managing special requests and preferences:

- Dietary restrictions and allergies
- Seating preferences
- Special occasions
- VIP status and special handling

## Testing and Certification

Most reservation platforms provide sandbox environments for testing:

1. **Sandbox Credentials**
   - Request developer access to sandbox environment
   - Use test credentials for development and testing
   - Never use production credentials in development

2. **Test Scenarios**
   - Create reservations for various party sizes and times
   - Modify existing reservations
   - Cancel reservations
   - Handle no-availability scenarios
   - Test error conditions and rate limiting`
    );
  }
}

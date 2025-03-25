# BrasserieBot AutoDev Knowledge Base

This directory contains the knowledge base for the BrasserieBot AutoDev agent, providing domain-specific knowledge about the hospitality industry and relevant technologies.

## Overview

The knowledge base is a Retrieval-Augmented Generation (RAG) system that enhances the AutoDev agent's capabilities by providing relevant domain knowledge when implementing features, fixing bugs, or generating documentation. It uses a vector database (Pinecone) to store and retrieve information efficiently.

## Directory Structure

The knowledge base is organized into the following categories:

- `restaurant_management/`: Information about restaurant management systems, features, and implementation
- `pos_integration/`: Details on integrating with Point of Sale systems
- `reservation_systems/`: Information about restaurant reservation platforms and APIs
- `inventory_procurement/`: Knowledge about inventory management and procurement processes
- `payment_processing/`: Information about payment systems and integrations
- `supplier_relations/`: Knowledge about managing supplier relationships and payments

Each category contains markdown files with detailed information about the specific domain.

## How It Works

1. **Vector Database**: The knowledge base uses Pinecone as a vector database to store and retrieve information efficiently.
2. **Embeddings**: Documents are converted to vector embeddings using OpenAI's text-embedding-3-small model.
3. **Data Ingestion**: The system processes documents from various sources, splits them into chunks, and stores them in the vector database.
4. **Retrieval**: When the AutoDev agent needs domain-specific knowledge, it queries the vector database to find relevant information.
5. **Prompt Enhancement**: The retrieved information is used to enhance the prompts sent to Claude, providing context and domain knowledge.

## Using the Knowledge Base

The knowledge base is integrated into the AutoDev agent and is used automatically when implementing features, fixing bugs, or generating documentation. You can also interact with the knowledge base directly using the following commands:

```bash
# Initialize the knowledge base
npm run init-kb

# Query the knowledge base
npm run start -- kb --query "How do POS systems integrate with payment processors?"

# Query with category filter
npm run start -- kb --query "reservation system APIs" --categories reservation_systems

# Limit the number of results
npm run start -- kb --query "inventory management" --limit 3
```

## Adding New Knowledge

You can add new knowledge to the system by:

1. Adding markdown files to the appropriate category directory
2. Running the data ingestion process:

```bash
npm run ingest
```

The system will automatically process the new files and add them to the vector database.

## Configuration

The knowledge base configuration is stored in `config/knowledge-base.json` and includes:

- Vector database settings (Pinecone API key, environment, index name)
- OpenAI API key for embeddings
- Data ingestion settings (chunk size, overlap, batch size)
- RAG system settings (similarity threshold, prompt templates)

You can modify these settings to customize the knowledge base behavior.

## Requirements

To use the knowledge base, you need:

1. A Pinecone account and API key
2. An OpenAI account and API key
3. Node.js 18 or higher

## Initialization

When you first set up the AutoDev agent, you'll be prompted to configure the knowledge base. You can also initialize it later using:

```bash
npm run init-kb
```

This will:

1. Create the Pinecone index if it doesn't exist
2. Load the initial dataset
3. Set up the data ingestion pipeline

## Troubleshooting

If you encounter issues with the knowledge base:

1. Check that your API keys are correct
2. Verify that the Pinecone index exists and is accessible
3. Check the logs for error messages
4. Try reinitializing the knowledge base with `npm run init-kb`

For more detailed information, refer to the [Pinecone documentation](https://docs.pinecone.io/) and [OpenAI API documentation](https://platform.openai.com/docs/guides/embeddings).
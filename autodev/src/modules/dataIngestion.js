/**
 * dataIngestion.js
 * Data ingestion pipeline for the knowledge base system
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { parse as parseCSV } from 'csv-parse/sync';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { PDFExtract } from 'pdf.js-extract';
import { Logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Data ingestion pipeline for the knowledge base
 */
export class DataIngestion {
  /**
   * Create a new DataIngestion instance
   * @param {Object} options - DataIngestion options
   * @param {Object} options.knowledgeBase - KnowledgeBase instance
   * @param {Object} options.config - Configuration object
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.events - Event emitter instance
   */
  constructor(options) {
    this.knowledgeBase = options.knowledgeBase;
    this.config = options.config;
    this.logger = options.logger || new Logger({ level: 'info' });
    this.events = options.events;
    this.pdfExtract = new PDFExtract();
    this.knowledgeDir = path.join(__dirname, '../../knowledge');
  }

  /**
   * Run the ingestion pipeline
   * @param {Object} options - Ingestion options
   * @param {Array<Object>} options.sources - Sources to ingest
   * @param {boolean} options.force - Force re-ingestion of all sources
   * @returns {Promise<Object>} Ingestion results
   */
  async run(options = {}) {
    const { sources = this.config.knowledgeBase.dataIngestion.sources, force = false } = options;
    
    try {
      this.logger.info(`Starting data ingestion pipeline with ${sources.length} sources`);
      
      let totalDocuments = 0;
      let totalChunks = 0;
      
      // Process each source
      for (const source of sources) {
        this.logger.info(`Processing source: ${source.type} - ${source.category}`);
        
        let result;
        
        switch (source.type) {
          case 'directory':
            result = await this.ingestDirectory(source);
            break;
          case 'url':
            result = await this.ingestUrl(source);
            break;
          case 'api':
            result = await this.ingestApi(source);
            break;
          case 'database':
            result = await this.ingestDatabase(source);
            break;
          default:
            this.logger.warn(`Unknown source type: ${source.type}`);
            continue;
        }
        
        if (result) {
          totalDocuments += result.documentsIngested;
          totalChunks += result.chunksIngested;
        }
      }
      
      this.logger.info(`Data ingestion complete: ${totalDocuments} documents, ${totalChunks} chunks`);
      
      return {
        success: true,
        documentsIngested: totalDocuments,
        chunksIngested: totalChunks,
      };
    } catch (error) {
      this.logger.error(`Data ingestion failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Ingest documents from a directory
   * @param {Object} source - Directory source configuration
   * @returns {Promise<Object>} Ingestion results
   */
  async ingestDirectory(source) {
    const { path: dirPath, pattern = '**/*.{md,txt,json,pdf,docx,csv,html}', category } = source;
    
    try {
      // Resolve directory path
      const resolvedPath = path.isAbsolute(dirPath)
        ? dirPath
        : path.join(this.knowledgeDir, dirPath.replace(/^\.\//, ''));
      
      // Find all matching files
      const files = await glob(pattern, {
        cwd: resolvedPath,
        absolute: false,
      });
      
      if (files.length === 0) {
        this.logger.warn(`No files found matching pattern: ${pattern} in directory: ${resolvedPath}`);
        return {
          success: true,
          documentsIngested: 0,
          chunksIngested: 0,
        };
      }
      
      // Read and process each file
      const documents = [];
      
      for (const file of files) {
        const filePath = path.join(resolvedPath, file);
        const fileExt = path.extname(file).substring(1).toLowerCase();
        
        try {
          let content;
          let metadata = {
            source: filePath,
            category,
            filename: file,
            type: fileExt,
          };
          
          // Process file based on extension
          switch (fileExt) {
            case 'pdf':
              content = await this.extractTextFromPdf(filePath);
              break;
            case 'docx':
              content = await this.extractTextFromDocx(filePath);
              break;
            case 'csv':
              content = await this.extractTextFromCsv(filePath);
              break;
            case 'html':
              content = await this.extractTextFromHtml(filePath);
              break;
            case 'json':
              const jsonContent = await fs.readFile(filePath, 'utf8');
              content = this.processJsonContent(jsonContent);
              break;
            default:
              content = await fs.readFile(filePath, 'utf8');
          }
          
          documents.push({
            text: content,
            metadata,
          });
        } catch (error) {
          this.logger.error(`Error processing file ${filePath}: ${error.message}`, error);
        }
      }
      
      // Ingest documents
      if (documents.length > 0) {
        return await this.knowledgeBase.ingestDocuments(documents);
      } else {
        return {
          success: true,
          documentsIngested: 0,
          chunksIngested: 0,
        };
      }
    } catch (error) {
      this.logger.error(`Directory ingestion failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Ingest content from a URL
   * @param {Object} source - URL source configuration
   * @returns {Promise<Object>} Ingestion results
   */
  async ingestUrl(source) {
    const { url, category, contentType } = source;
    
    try {
      this.logger.info(`Ingesting content from URL: ${url}`);
      
      // Fetch content from URL
      const response = await axios.get(url, {
        responseType: contentType === 'pdf' ? 'arraybuffer' : 'text',
        headers: {
          'User-Agent': 'BrasserieBot Knowledge Base Ingestion/1.0',
        },
      });
      
      let content;
      const metadata = {
        source: url,
        category,
        type: contentType || 'url',
      };
      
      // Process content based on type
      switch (contentType) {
        case 'pdf':
          const buffer = Buffer.from(response.data);
          content = await this.extractTextFromPdfBuffer(buffer);
          break;
        case 'html':
          content = this.extractTextFromHtmlString(response.data);
          break;
        case 'json':
          content = this.processJsonContent(response.data);
          break;
        default:
          content = typeof response.data === 'string' 
            ? response.data 
            : JSON.stringify(response.data, null, 2);
      }
      
      // Ingest document
      return await this.knowledgeBase.ingestDocuments([
        { text: content, metadata }
      ]);
    } catch (error) {
      this.logger.error(`URL ingestion failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Ingest content from an API
   * @param {Object} source - API source configuration
   * @returns {Promise<Object>} Ingestion results
   */
  async ingestApi(source) {
    const { url, method = 'GET', headers = {}, data, category, contentPath, contentType } = source;
    
    try {
      this.logger.info(`Ingesting content from API: ${url}`);
      
      // Make API request
      const response = await axios({
        method,
        url,
        headers,
        data,
      });
      
      // Extract content using contentPath if specified
      let content = response.data;
      if (contentPath) {
        content = contentPath.split('.').reduce((obj, key) => obj && obj[key], content);
        
        if (!content) {
          throw new Error(`Content path ${contentPath} not found in API response`);
        }
      }
      
      // Process content based on type
      let processedContent;
      switch (contentType) {
        case 'html':
          processedContent = this.extractTextFromHtmlString(content);
          break;
        case 'json':
          processedContent = this.processJsonContent(content);
          break;
        default:
          processedContent = typeof content === 'string' 
            ? content 
            : JSON.stringify(content, null, 2);
      }
      
      // Create documents
      const documents = Array.isArray(content) 
        ? content.map((item, index) => ({
            text: typeof item === 'string' ? item : JSON.stringify(item, null, 2),
            metadata: {
              source: `${url}[${index}]`,
              category,
              type: contentType || 'api',
            },
          }))
        : [
            {
              text: processedContent,
              metadata: {
                source: url,
                category,
                type: contentType || 'api',
              },
            }
          ];
      
      // Ingest documents
      return await this.knowledgeBase.ingestDocuments(documents);
    } catch (error) {
      this.logger.error(`API ingestion failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Ingest content from a database
   * @param {Object} source - Database source configuration
   * @returns {Promise<Object>} Ingestion results
   */
  async ingestDatabase(source) {
    // This is a placeholder for database ingestion
    // In a real implementation, this would connect to a database and extract data
    this.logger.warn('Database ingestion not implemented');
    
    return {
      success: false,
      error: 'Database ingestion not implemented',
      documentsIngested: 0,
      chunksIngested: 0,
    };
  }

  /**
   * Extract text from a PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractTextFromPdf(filePath) {
    try {
      const data = await this.pdfExtract.extract(filePath, {});
      
      // Combine text from all pages
      return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n\n');
    } catch (error) {
      this.logger.error(`PDF extraction failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Extract text from a PDF buffer
   * @param {Buffer} buffer - PDF buffer
   * @returns {Promise<string>} Extracted text
   */
  async extractTextFromPdfBuffer(buffer) {
    try {
      const data = await this.pdfExtract.extractBuffer(buffer, {});
      
      // Combine text from all pages
      return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n\n');
    } catch (error) {
      this.logger.error(`PDF buffer extraction failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Extract text from a DOCX file
   * @param {string} filePath - Path to the DOCX file
   * @returns {Promise<string>} Extracted text
   */
  async extractTextFromDocx(filePath) {
    // This is a placeholder for DOCX extraction
    // In a real implementation, this would use a library like mammoth.js
    this.logger.warn('DOCX extraction not implemented');
    
    // Fallback to reading as text
    return await fs.readFile(filePath, 'utf8');
  }

  /**
   * Extract text from a CSV file
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<string>} Extracted text
   */
  async extractTextFromCsv(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const records = parseCSV(content, { columns: true });
      
      // Convert CSV to a more readable format
      return records.map(record => {
        return Object.entries(record)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }).join('\n\n');
    } catch (error) {
      this.logger.error(`CSV extraction failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Extract text from an HTML file
   * @param {string} filePath - Path to the HTML file
   * @returns {Promise<string>} Extracted text
   */
  async extractTextFromHtml(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return this.extractTextFromHtmlString(content);
    } catch (error) {
      this.logger.error(`HTML extraction failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Extract text from an HTML string
   * @param {string} html - HTML content
   * @returns {string} Extracted text
   */
  extractTextFromHtmlString(html) {
    try {
      const dom = new JSDOM(html);
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      return article ? article.textContent : dom.window.document.body.textContent;
    } catch (error) {
      this.logger.error(`HTML string extraction failed: ${error.message}`, error);
      return html;
    }
  }

  /**
   * Process JSON content
   * @param {string|Object} content - JSON content
   * @returns {string} Processed text
   */
  processJsonContent(content) {
    try {
      // Parse if string
      const jsonData = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Convert to a more readable format
      return JSON.stringify(jsonData, null, 2);
    } catch (error) {
      this.logger.error(`JSON processing failed: ${error.message}`, error);
      return typeof content === 'string' ? content : JSON.stringify(content);
    }
  }

  /**
   * Schedule ingestion jobs
   * @returns {Promise<void>}
   */
  async scheduleJobs() {
    const schedules = this.config.knowledgeBase.dataIngestion.schedules || [];
    
    this.logger.info(`Scheduling ${schedules.length} ingestion jobs`);
    
    // This is a placeholder for scheduling
    // In a real implementation, this would use a library like node-cron
    for (const schedule of schedules) {
      this.logger.info(`Scheduled job: ${schedule.name} - ${schedule.cron}`);
    }
  }
}

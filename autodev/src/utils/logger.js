/**
 * logger.js
 * Logging utility for the AutoDev agent
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Logger class for consistent logging throughout the application
 */
export class Logger {
  /**
   * Create a new logger instance
   * @param {Object} options - Logger options
   * @param {string} [options.level='info'] - Log level (error, warn, info, verbose, debug, silly)
   * @param {string} [options.file] - Log file path
   * @param {boolean} [options.console=true] - Whether to log to console
   */
  constructor(options = {}) {
    const {
      level = 'info',
      file,
      console: consoleEnabled = true
    } = options;
    
    // Create logs directory if it doesn't exist
    if (file) {
      const logDir = path.dirname(file);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
    
    // Configure winston transports
    const transports = [];
    
    // Add console transport if enabled
    if (consoleEnabled) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} ${level}: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`;
            })
          )
        })
      );
    }
    
    // Add file transport if file path is provided
    if (file) {
      transports.push(
        new winston.transports.File({
          filename: file,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }
    
    // Create winston logger
    this.logger = winston.createLogger({
      level,
      levels: winston.config.npm.levels,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports,
      exitOnError: false
    });
    
    this.logger.info('Logger initialized', { level });
  }
  
  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Error|Object} [error] - Error object or additional data
   */
  error(message, error) {
    if (error instanceof Error) {
      this.logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          ...error
        }
      });
    } else {
      this.logger.error(message, error);
    }
  }
  
  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} [meta] - Additional metadata
   */
  warn(message, meta) {
    this.logger.warn(message, meta);
  }
  
  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} [meta] - Additional metadata
   */
  info(message, meta) {
    this.logger.info(message, meta);
  }
  
  /**
   * Log a debug message
   * @param {string} message - Debug message
   * @param {Object} [meta] - Additional metadata
   */
  debug(message, meta) {
    this.logger.debug(message, meta);
  }
  
  /**
   * Log a verbose message
   * @param {string} message - Verbose message
   * @param {Object} [meta] - Additional metadata
   */
  verbose(message, meta) {
    this.logger.verbose(message, meta);
  }
  
  /**
   * Create a child logger with additional default metadata
   * @param {Object} defaultMeta - Default metadata to include in all logs
   * @returns {Logger} Child logger instance
   */
  child(defaultMeta) {
    const childLogger = new Logger({
      level: this.logger.level,
      console: false,
      file: null
    });
    
    childLogger.logger = this.logger.child(defaultMeta);
    return childLogger;
  }
}
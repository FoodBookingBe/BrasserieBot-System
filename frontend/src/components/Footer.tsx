import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="font-semibold text-gray-700">BrasserieBot System</h3>
            <p className="text-sm text-gray-500">AI-Driven Hospitality Operating System</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center space-x-4 mb-2">
              <a href="https://github.com/BrasserieBot-System" target="_blank" rel="noopener noreferrer"
                 className="text-gray-600 hover:text-gray-900">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://app.netlify.com/sites/foodbookingai/deploys" target="_blank" rel="noopener noreferrer"
                 className="text-gray-600 hover:text-gray-900">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.547 21.425c-3.254-.34-6-2.482-7.147-5.447l7.694-3.367 7.694 3.367c-1.146 2.965-3.893 5.107-7.147 5.447h-1.094zM20.57 14.336l-6.764-2.96 3.015-6.055c1.688 1.447 2.88 3.494 3.368 5.81.257 1.137.21 2.237.38 3.205zm-6.68-4.304L9.86 10.03l2.03-4.075 2.03 4.075-.03.003zm-5.406 1.344L2.72 14.336c.172-.968.124-2.068.38-3.205.489-2.316 1.68-4.363 3.368-5.81l3.015 6.055zm-.93-6.934c1.136-1.2 2.64-2.13 4.446-2.57h1.093c1.808.44 3.31 1.37 4.447 2.57L12 7.257 7.554 4.442zM12 1.692c-1.487 0-2.813.282-3.843.806L12 4.442l3.843-1.944c-1.03-.524-2.356-.806-3.843-.806z"/>
                </svg>
              </a>
            </div>
            <a
              href="https://app.netlify.com/sites/foodbookingai/deploys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img 
                src="https://api.netlify.com/api/v1/badges/54f0d686-505e-42c9-a1e4-bd88412d859c/deploy-status" 
                alt="Netlify Status" 
                className="h-6"
              />
            </a>
            <p className="text-xs text-gray-500 mt-2">
              ©{new Date().getFullYear()} BrasserieBot System | Powered by Netlify
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
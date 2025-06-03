import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, CreditCard, ScrollText, HelpCircle } from 'lucide-react';
import PaywallModal from '../components/PaywallModal';
import { useState } from 'react';

export default function Legal() {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate dark:text-white ml-2">Legal</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          {/* Privacy Policy */}
          <a
            href="https://mapbreak.app/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-terra mr-4" />
              <div>
                <h2 className="text-lg font-medium text-slate dark:text-white">Privacy Policy</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Learn how we collect and use your data
                </p>
              </div>
            </div>
          </a>

          {/* Terms of Use */}
          <a
            href="https://mapbreak.app/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-terra mr-4" />
              <div>
                <h2 className="text-lg font-medium text-slate dark:text-white">Terms of Use</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Read our terms and conditions
                </p>
              </div>
            </div>
          </a>

          {/* Subscription Terms */}
          <button
            onClick={() => setShowPaywall(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-terra mr-4" />
              <div>
                <h2 className="text-lg font-medium text-slate dark:text-white">Subscription Terms</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  $4.99/month or $59.88/year
                </p>
              </div>
            </div>
          </button>

          {/* Licenses & Attributions */}
          <a
            href="https://mapbreak.app/licenses"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <ScrollText className="h-6 w-6 text-terra mr-4" />
              <div>
                <h2 className="text-lg font-medium text-slate dark:text-white">Licenses & Attributions</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View third-party licenses and credits
                </p>
              </div>
            </div>
          </a>

          {/* Contact / Support */}
          <a
            href="mailto:bmc239@gmail.com"
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <HelpCircle className="h-6 w-6 text-terra mr-4" />
              <div>
                <h2 className="text-lg font-medium text-slate dark:text-white">Contact / Support</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  bmc239@gmail.com
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
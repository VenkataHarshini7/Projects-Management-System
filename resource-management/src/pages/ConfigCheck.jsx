import { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ConfigCheck = () => {
  const [checks, setChecks] = useState({
    firebaseInit: false,
    authInit: false,
    firestoreInit: false,
    configValid: false
  });

  useEffect(() => {
    try {
      // Check if Firebase is initialized
      const firebaseInit = !!auth.app;

      // Check if Auth is initialized
      const authInit = !!auth;

      // Check if Firestore is initialized
      const firestoreInit = !!db;

      // Check if config has placeholder values
      const config = auth.app.options;
      const configValid = config.apiKey !== 'YOUR_API_KEY' &&
                         config.apiKey &&
                         !config.apiKey.includes('YOUR_');

      setChecks({
        firebaseInit,
        authInit,
        firestoreInit,
        configValid,
        config: config
      });
    } catch (error) {
      console.error('Config check error:', error);
    }
  }, []);

  const StatusIcon = ({ status }) => {
    if (status === true) return <CheckCircle className="text-green-600" size={24} />;
    if (status === false) return <XCircle className="text-red-600" size={24} />;
    return <AlertCircle className="text-yellow-600" size={24} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Firebase Configuration Check
        </h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center gap-4">
            <StatusIcon status={checks.firebaseInit} />
            <div>
              <h3 className="font-semibold text-gray-900">Firebase Initialized</h3>
              <p className="text-sm text-gray-600">
                {checks.firebaseInit ? 'Firebase app is initialized' : 'Firebase app failed to initialize'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StatusIcon status={checks.authInit} />
            <div>
              <h3 className="font-semibold text-gray-900">Authentication Service</h3>
              <p className="text-sm text-gray-600">
                {checks.authInit ? 'Auth service is ready' : 'Auth service not initialized'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StatusIcon status={checks.firestoreInit} />
            <div>
              <h3 className="font-semibold text-gray-900">Firestore Database</h3>
              <p className="text-sm text-gray-600">
                {checks.firestoreInit ? 'Firestore is ready' : 'Firestore not initialized'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StatusIcon status={checks.configValid} />
            <div>
              <h3 className="font-semibold text-gray-900">Configuration Valid</h3>
              <p className="text-sm text-gray-600">
                {checks.configValid
                  ? 'Firebase config looks correct'
                  : 'Firebase config contains placeholder values. Update src/services/firebase.js'}
              </p>
            </div>
          </div>

          {checks.config && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Current Configuration:</h3>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify({
                  apiKey: checks.config.apiKey?.substring(0, 20) + '...',
                  authDomain: checks.config.authDomain,
                  projectId: checks.config.projectId,
                  storageBucket: checks.config.storageBucket,
                  messagingSenderId: checks.config.messagingSenderId,
                  appId: checks.config.appId?.substring(0, 30) + '...'
                }, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://console.firebase.google.com/project/eastman-eb9cf/settings/general" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
              <li>Scroll to "Your apps" section</li>
              <li>Click the Web app icon or create one</li>
              <li>Copy the firebaseConfig object</li>
              <li>Update src/services/firebase.js with the real values</li>
              <li>Enable Email/Password authentication in Firebase Console</li>
              <li>Create Firestore database in test mode</li>
            </ol>
          </div>

          <div className="flex gap-4">
            <a
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Signup
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Refresh Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigCheck;

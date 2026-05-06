/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './AppContext';
import AppContent from './AppContent';

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

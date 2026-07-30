/**
 * server/services/userService.ts
 * User profile and preferences orchestration.
 */

import { userRepository, DbUserPreferences } from '../repositories/userRepository.js';
import { NotFoundError } from '../utils/errors.js';

export const userService = {
  getPreferences(userId: string) {
    const prefs = userRepository.getPreferences(userId);
    if (!prefs) throw new NotFoundError('Preferences');
    return prefs;
  },

  updatePreferences(userId: string, data: {
    theme?: string;
    defaultDomain?: string;
    aiVerbosity?: string;
    autoExpand?: boolean;
    graphLayout?: string;
    exportFormat?: string;
    showEvidence?: boolean;
    showExperts?: boolean;
    showHistorical?: boolean;
    notificationsEnabled?: boolean;
  }): DbUserPreferences | undefined {
    userRepository.updatePreferences(userId, {
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.defaultDomain !== undefined && { default_domain: data.defaultDomain }),
      ...(data.aiVerbosity !== undefined && { ai_verbosity: data.aiVerbosity }),
      ...(data.autoExpand !== undefined && { auto_expand: data.autoExpand ? 1 : 0 }),
      ...(data.graphLayout !== undefined && { graph_layout: data.graphLayout }),
      ...(data.exportFormat !== undefined && { export_format: data.exportFormat }),
      ...(data.showEvidence !== undefined && { show_evidence: data.showEvidence ? 1 : 0 }),
      ...(data.showExperts !== undefined && { show_experts: data.showExperts ? 1 : 0 }),
      ...(data.showHistorical !== undefined && { show_historical: data.showHistorical ? 1 : 0 }),
      ...(data.notificationsEnabled !== undefined && { notifications_enabled: data.notificationsEnabled ? 1 : 0 }),
    });
    return userRepository.getPreferences(userId);
  },

  updateProfile(userId: string, data: { displayName?: string; bio?: string }) {
    userRepository.update(userId, {
      ...(data.displayName !== undefined && { display_name: data.displayName }),
      ...(data.bio !== undefined && { bio: data.bio }),
    });
    const user = userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
    };
  },
};

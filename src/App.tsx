import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useQuests } from './hooks/useQuests';
import { useInventory } from './hooks/useInventory';
import { useHistory } from './hooks/useHistory';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { QuestsPage } from './pages/QuestsPage';
import { RewardsPage } from './pages/RewardsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { CelebrationModal } from './components/CelebrationModal';
import { QuestModal } from './components/QuestModal';
import { QuestCategory, QuestCompletionResult, RewardItemType } from './types/rpg';
import { createQuest, updateQuest, deleteQuest } from './services/questService';
import { executeCompleteQuest, executePurchaseReward } from './services/rpgService';
import { equipCosmetic, unequipCosmetic } from './services/inventoryService';
import { Shield } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, profile, loading: authLoading, logout, isGuest, enterAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [celebrationResult, setCelebrationResult] = useState<QuestCompletionResult | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialSignUp, setAuthInitialSignUp] = useState(false);
  const [viewingLanding, setViewingLanding] = useState(false);

  const { quests, activeQuests, loading: questsLoading } = useQuests(user?.uid);
  const { inventory, loading: inventoryLoading } = useInventory(user?.uid);
  const { history } = useHistory(user?.uid, 6);

  // Initial loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 animate-pulse">
          <Shield className="h-7 w-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-white tracking-wide">
          Awakening Codex...
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Synchronizing character progression with Cloud Firestore.
        </p>
      </div>
    );
  }

  // If Auth modal is open, render AuthPage with cancel/guest fallback
  if (showAuthModal) {
    return (
      <AuthPage
        initialIsSignUp={authInitialSignUp}
        onCancel={() => setShowAuthModal(false)}
        onGuestPlay={() => {
          enterAsGuest();
          setShowAuthModal(false);
          setViewingLanding(false);
        }}
      />
    );
  }

  // If user is not authenticated/guest, OR has chosen to view the landing page
  if (!user || !profile || viewingLanding) {
    return (
      <LandingPage
        onStartGuest={() => {
          if (!user || !profile) {
            enterAsGuest();
          }
          setViewingLanding(false);
        }}
        onOpenAuth={(isSignUp) => {
          setAuthInitialSignUp(!!isSignUp);
          setShowAuthModal(true);
        }}
      />
    );
  }

  // Authoritative quest completion
  const handleCompleteQuest = async (questId: string) => {
    const result = await executeCompleteQuest(user.uid, questId);
    setCelebrationResult(result);
  };

  // Quest CRUD operations
  const handleCreateQuest = async (title: string, category: QuestCategory) => {
    await createQuest(user.uid, title, category);
  };

  const handleUpdateQuest = async (questId: string, title: string, category: QuestCategory) => {
    await updateQuest(user.uid, questId, title, category);
  };

  const handleDeleteQuest = async (questId: string) => {
    await deleteQuest(user.uid, questId);
  };

  // Authoritative Reward Purchase
  const handlePurchaseReward = async (itemId: string) => {
    await executePurchaseReward(user.uid, itemId);
  };

  // Equip / Unequip Cosmetics
  const handleEquipCosmetic = async (type: RewardItemType, itemId: string) => {
    await equipCosmetic(user.uid, type, itemId);
  };

  const handleUnequipCosmetic = async (type: RewardItemType) => {
    await unequipCosmetic(user.uid, type);
  };

  // Dynamic theme background class based on equipped theme
  const themeClass =
    profile.equippedTheme === 'theme_emerald'
      ? 'selection:bg-emerald-500/30 selection:text-emerald-200'
      : profile.equippedTheme === 'theme_crimson'
      ? 'selection:bg-rose-500/30 selection:text-rose-200'
      : profile.equippedTheme === 'theme_solar'
      ? 'selection:bg-amber-500/30 selection:text-amber-200'
      : 'selection:bg-amber-500/30 selection:text-amber-200';

  return (
    <div className={`min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col ${themeClass}`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        onLogout={() => {
          logout();
          setViewingLanding(true);
        }}
        isGuest={isGuest}
        onShowLanding={() => setViewingLanding(true)}
        onOpenAuth={() => {
          setAuthInitialSignUp(false);
          setShowAuthModal(true);
        }}
      />

      {/* Main Page Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            profile={profile}
            activeQuests={activeQuests}
            recentHistory={history}
            onCompleteQuest={handleCompleteQuest}
            onOpenCreateQuest={() => setIsQuestModalOpen(true)}
            onNavigateToQuests={() => setActiveTab('quests')}
            onNavigateToRewards={() => setActiveTab('rewards')}
          />
        )}

        {activeTab === 'quests' && (
          <QuestsPage
            quests={quests}
            loading={questsLoading}
            onCreateQuest={handleCreateQuest}
            onUpdateQuest={handleUpdateQuest}
            onDeleteQuest={handleDeleteQuest}
            onCompleteQuest={handleCompleteQuest}
            isModalOpen={isQuestModalOpen}
            onCloseModal={() => setIsQuestModalOpen(false)}
            onOpenModal={() => setIsQuestModalOpen(true)}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsPage
            profile={profile}
            inventory={inventory}
            onPurchaseReward={handlePurchaseReward}
            onEquipCosmetic={handleEquipCosmetic}
            onUnequipCosmetic={handleUnequipCosmetic}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            profile={profile}
            inventory={inventory}
            onLogout={logout}
          />
        )}
      </main>

      {/* Quick Quest Modal from anywhere */}
      <QuestModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
        onSubmit={handleCreateQuest}
        initialQuest={null}
      />

      {/* Celebratory Completion Feedback Modal */}
      <CelebrationModal
        result={celebrationResult}
        onClose={() => setCelebrationResult(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

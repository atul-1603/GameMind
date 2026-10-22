import React from 'react';
import { Box, BookOpen, Layers, BarChart3, HelpCircle } from 'lucide-react';

interface NavbarProps {
  currentTab: 'play' | 'lab' | 'theory';
  onSelectTab: (tab: 'play' | 'lab' | 'theory') => void;
  currentLevelName: string;
  onOpenLevelSelect: () => void;
  onOpenTutorial: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentLevelName,
  onOpenLevelSelect,
  onOpenTutorial,
}) => {
  return (
    <header className="navbar-header">
      {/* Brand Title */}
      <div className="brand-section">
        <div className="brand-icon-box">
          <Box style={{ width: '22px', height: '22px', color: '#ffffff' }} />
        </div>
        <div className="brand-title-wrap">
          <div className="brand-title-row">
            <span className="brand-title">DimensionShift</span>
            <span className="brand-badge">DAA Lab</span>
          </div>
          <span className="brand-sub">3D Sokoban Puzzle &amp; AI Algorithm Lab</span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          onClick={() => onSelectTab('play')}
          className={`nav-tab-btn ${currentTab === 'play' ? 'active-play' : ''}`}
        >
          <Box style={{ width: '16px', height: '16px' }} />
          <span>Play Game</span>
        </button>

        <button
          onClick={() => onSelectTab('lab')}
          className={`nav-tab-btn ${currentTab === 'lab' ? 'active-lab' : ''}`}
        >
          <BarChart3 style={{ width: '16px', height: '16px' }} />
          <span>Algorithm Lab</span>
        </button>

        <button
          onClick={() => onSelectTab('theory')}
          className={`nav-tab-btn ${currentTab === 'theory' ? 'active-theory' : ''}`}
        >
          <BookOpen style={{ width: '16px', height: '16px' }} />
          <span>Academic Details</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="navbar-right">
        <button onClick={onOpenLevelSelect} className="btn-secondary" title="Select Chamber Level">
          <Layers style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
          <span>{currentLevelName}</span>
        </button>

        <button onClick={onOpenTutorial} className="btn-icon" title="Tutorial &amp; Rules">
          <HelpCircle style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </header>
  );
};
